// src/controllers/usuario.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

// ---------------------- helpers ----------------------
const onlyDigits = (v?: string) => (v ?? '').replace(/\D/g, '');
const toNullableLowerCase = (v?: string | null) =>
  (v ?? '').trim() === '' ? null : (v as string).trim().toLowerCase();

// remove hash de senha do retorno
const sanitizeUsuario = <T extends { senha?: string }>(u: T) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { senha, ...rest } = u as any;
  return rest;
};

// 'YYYY-MM-DD' -> Date | null (UTC 00:00)
const parseNascimento = (n?: unknown): Date | null => {
  if (typeof n !== 'string') return null;
  const s = n.trim();
  if (!s) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
};

// enum minúsculo no schema: 'adm' | 'vendedor' | 'filiado'
const normalizeTipo = (raw?: string | null): 'adm' | 'vendedor' | 'filiado' | null => {
  const lower = String(raw ?? '').trim().toLowerCase();
  if (lower === 'adm' || lower === 'vendedor' || lower === 'filiado') return lower;
  return null;
};

// Campos padrão (nunca retornamos senha)
const userSelect = {
  id: true,
  nome: true,
  cpf: true,
  email: true,
  tipo: true,
  filialId: true,
  cidade: true,
  nascimento: true,
  whatsapp: true,
  avatar: true,
  criadoEm: true,
} as const;

// ---------------------- GET /usuarios ----------------------
export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
      select: userSelect,
    });
    res.json(usuarios);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('GET /usuarios', error);
    res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
};

// ---------------------- GET /usuarios/:cpf ----------------------
export const obterUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { cpf: onlyDigits(req.params.cpf) },
      select: userSelect,
    });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(usuario);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('GET /usuarios/:cpf', error);
    res.status(500).json({ erro: 'Erro ao obter usuário.' });
  }
};

// ---------------------- POST /usuarios ----------------------
export const salvarUsuario = async (req: Request, res: Response) => {
  try {
    const {
      nome,
      email,
      senha,
      tipo,        // 'adm' | 'vendedor' | 'filiado'
      cidade,
      cpf,
      nascimento,  // 'YYYY-MM-DD'
      whatsapp,
      filialId,
    } = req.body ?? {};

    // Log de debug (apenas dev)
    if (process.env.NODE_ENV !== 'production') {
      console.log('POST /usuarios payload:', {
        nome, email, tipo, cidade, cpf, nascimento, whatsapp, filialId,
      });
    }

    if (!nome || !senha || !tipo || !cpf) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, senha, tipo, cpf.' });
    }

    // normaliza e valida tipo
    const tipoNorm = (() => {
      const t = String(tipo).trim().toLowerCase();
      return t === 'adm' || t === 'vendedor' || t === 'filiado' ? t : null;
    })();
    if (!tipoNorm) {
      return res.status(400).json({ erro: 'Tipo inválido. Use: adm, vendedor ou filiado.' });
    }

    const cpfClean = (cpf ?? '').replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      return res.status(400).json({ erro: 'CPF inválido. Envie 11 dígitos.' });
    }

    // se vier filialId, checa existência para retornar 400 em vez de 500
    if (filialId) {
      const filial = await prisma.filial.findUnique({ where: { id: String(filialId) } });
      if (!filial) return res.status(400).json({ erro: 'Filial inválida.' });
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);

    const data: any = {
      nome: String(nome).trim(),
      tipo: tipoNorm,
      cpf: cpfClean,
      nascimento: typeof nascimento === 'string' && nascimento.trim()
        ? new Date(`${nascimento.trim()}T00:00:00.000Z`)
        : null,
      cidade: (cidade ?? '').trim() || null,
      whatsapp: (whatsapp ?? '').replace(/\D/g, '') || null,
      filialId: filialId || null,
      senha: senhaHash, // seu schema usa "senha"
    };
    if (email !== undefined) {
      const e = (email ?? '').toString().trim().toLowerCase();
      data.email = e === '' ? null : e;
    }

    const novoUsuario = await prisma.usuario.create({ data, select: userSelect });
    return res.status(201).json(novoUsuario);
  } catch (error: any) {
    // 🔎 DEV: exponha detalhes p/ diagnosticar
    if (process.env.NODE_ENV !== 'production') {
      console.error('POST /usuarios ERROR:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
        stack: error?.stack,
      });
      return res.status(500).json({
        erro: 'Erro ao salvar usuário.',
        code: error?.code,
        detalhe: error?.message,
        meta: error?.meta,
      });
    }

    // Prod: mapeia erros comuns
    if (error?.code === 'P2002') return res.status(409).json({ erro: 'CPF ou e-mail já cadastrado.' });
    if (error?.code === 'P2003') return res.status(400).json({ erro: 'Filial inválida.' });
    return res.status(500).json({ erro: 'Erro ao salvar usuário.' });
  }
};

// ---------------------- PUT /usuarios/:cpf ----------------------
export const atualizarUsuario = async (req: Request, res: Response) => {
  try {
    const {
      nome, email, senha, tipo, cidade, nascimento, whatsapp, avatar, filialId,
    } = req.body ?? {};

    const data: any = {};
    if (nome !== undefined) data.nome = String(nome).trim();
    if (email !== undefined) data.email = toNullableLowerCase(email);
    if (tipo !== undefined) {
      const t = normalizeTipo(tipo);
      if (!t) return res.status(400).json({ erro: 'Tipo inválido.' });
      data.tipo = t;
    }
    if (cidade !== undefined) data.cidade = (cidade ?? '').trim() || null;
    if (nascimento !== undefined) data.nascimento = parseNascimento(nascimento);
    if (whatsapp !== undefined) data.whatsapp = onlyDigits(whatsapp) || null;
    if (avatar !== undefined) data.avatar = avatar ?? null;
    if (filialId !== undefined) data.filialId = filialId || null;

    if (senha !== undefined && String(senha).trim() !== '') {
      data.senha = await bcrypt.hash(String(senha), 10);
    }

    const atualizado = await prisma.usuario.update({
      where: { cpf: onlyDigits(req.params.cpf) },
      data,
      select: userSelect,
    });

    res.json(atualizado);
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') console.error('PUT /usuarios/:cpf', error);
    if (error?.code === 'P2002') return res.status(409).json({ erro: 'CPF ou e-mail já cadastrado.' });
    if (error?.code === 'P2025') return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.status(500).json({ erro: 'Erro ao atualizar usuário.' });
  }
};

// ---------------------- DELETE /usuarios/:cpf ----------------------
export const deletarUsuario = async (req: Request, res: Response) => {
  try {
    await prisma.usuario.delete({ where: { cpf: onlyDigits(req.params.cpf) } });
    res.json({ mensagem: 'Usuário removido com sucesso.' });
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') console.error('DELETE /usuarios/:cpf', error);
    if (error?.code === 'P2025') return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (error?.code === 'P2003') return res.status(400).json({ erro: 'Não é possível remover: existem registros vinculados.' });
    res.status(500).json({ erro: 'Erro ao remover usuário.' });
  }
};

// ---------------------- POST /usuarios/login ----------------------
export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { identificador, senha } = req.body ?? {};
    if (!identificador || !senha) {
      return res.status(400).json({ erro: 'Informe identificador e senha.' });
    }

    const cpf = onlyDigits(identificador);
    const email = toNullableLowerCase(identificador);

    const usuario = await prisma.usuario.findFirst({
      where: { OR: [ ...(cpf ? [{ cpf }] : []), ...(email ? [{ email }] : []) ] },
      select: {
        id: true, cpf: true, tipo: true, filialId: true, nome: true,
        senha: true, // << do schema
      },
    });
    if (!usuario || !usuario.senha) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const ok = await bcrypt.compare(String(senha), usuario.senha);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { id: usuario.id, cpf: usuario.cpf, tipo: usuario.tipo, filialId: usuario.filialId },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '8h' }
    );

    res.json({ usuario: sanitizeUsuario(usuario), tipo: usuario.tipo, token });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('POST /usuarios/login', error);
    res.status(500).json({ erro: 'Erro no login.' });
  }
};

// ---------------------- POST /usuarios/:cpf/avatar ----------------------
export const atualizarAvatar = async (req: Request, res: Response) => {
  try {
    const cpf = onlyDigits(req.params.cpf);
    if (!cpf) return res.status(400).json({ erro: 'CPF inválido.' });
    if (!req.file) return res.status(400).json({ erro: 'Arquivo não enviado.' });

    const publicPath = `/uploads/avatars/${req.file.filename}`;

    const usuario = await prisma.usuario.update({
      where: { cpf },
      data: { avatar: publicPath },
      select: userSelect,
    });

    res.json({ mensagem: 'Avatar atualizado com sucesso.', avatar: publicPath, usuario });
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') console.error('POST /usuarios/:cpf/avatar', error);
    if (error?.code === 'P2025') return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.status(500).json({ erro: 'Erro ao atualizar avatar.' });
  }
};
