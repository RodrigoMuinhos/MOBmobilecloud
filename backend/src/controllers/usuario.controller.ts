import { Request, Response } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ==== NOVO: dependências para upload ====
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// ---------------------- Helpers ----------------------
const onlyDigits = (v?: string) => (v ?? '').replace(/\D/g, '');
const toNullableLowerCase = (v?: string | null) =>
  (v ?? '').trim() === '' ? null : (v as string).trim().toLowerCase();
const sanitizeUsuario = <T extends { senha?: string }>(u: T) => {
  const { senha, ...rest } = u;
  return rest;
};

// Converte 'YYYY-MM-DD' -> Date | null (UTC 00:00)
const parseNascimento = (n?: unknown): Date | null => {
  if (typeof n !== 'string') return null;
  const s = n.trim();
  if (!s) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
};

// ---------------------- GET /usuarios ----------------------
export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(usuarios.map(sanitizeUsuario));
  } catch (error: any) {
    console.error('Erro no GET /usuarios:');
    console.error('code:', error?.code);
    console.error('message:', error?.message);
    console.error('meta:', error?.meta);
    console.error('stack:', error?.stack);
    res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
};

// ---------------------- GET /usuarios/:cpf ----------------------
export const obterUsuario = async (req: Request, res: Response) => {
  const { cpf } = req.params;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { cpf: onlyDigits(cpf) } });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(sanitizeUsuario(usuario));
  } catch (error) {
    console.error('Erro no GET /usuarios/:cpf:', error);
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
      tipo,
      cidade,
      cpf,
      nascimento, // string (ex: 'YYYY-MM-DD')
      whatsapp,
      avatar,
    } = req.body ?? {};

    if (!nome || !senha || !tipo || !cpf) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, senha, tipo, cpf.' });
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);

const novoUsuario = await prisma.usuario.create({
  data: {
    nome: String(nome).trim(), // Garante que nome seja string
    email: toNullableLowerCase(email) ?? '', // Substitui undefined por string vazia
    senha: senhaHash,
    tipo: String(tipo).trim(), // 'adm' | 'vendedor' | 'filiado'
    cidade: (cidade ?? '').trim() || null, // Se cidade for null, será null no banco
    cpf: onlyDigits(cpf), // unique
    nascimento: parseNascimento(nascimento) ?? new Date(), // Substitui null por data atual
    whatsapp: onlyDigits(whatsapp) || '', // Substitui null por string vazia
    avatar: avatar ?? null, // Pode ser preenchido depois pelo endpoint de upload
  },
});


    res.status(201).json(sanitizeUsuario(novoUsuario));
  } catch (error: any) {
    console.error('Erro no POST /usuarios:', error);
    if (error?.code === 'P2002') {
      return res.status(409).json({ erro: 'CPF ou e-mail já cadastrado.' });
    }
    res.status(500).json({ erro: 'Erro ao salvar usuário.' });
  }
};

// ---------------------- PUT /usuarios/:cpf ----------------------
export const atualizarUsuario = async (req: Request, res: Response) => {
  const { cpf } = req.params;
  try {
    const {
      nome,
      email,
      senha,
      tipo,
      cidade,
      nascimento, // string 'YYYY-MM-DD'
      whatsapp,
      avatar,
    } = req.body ?? {};

    const data: any = {};
    if (nome !== undefined) data.nome = String(nome).trim();
    if (email !== undefined) data.email = toNullableLowerCase(email);
    if (tipo !== undefined) data.tipo = String(tipo).trim();
    if (cidade !== undefined) data.cidade = (cidade ?? '').trim() || null;
    if (nascimento !== undefined) data.nascimento = parseNascimento(nascimento);
    if (whatsapp !== undefined) data.whatsapp = onlyDigits(whatsapp) || null;
    if (avatar !== undefined) data.avatar = avatar ?? null;
    if (senha !== undefined && String(senha).trim() !== '') {
      data.senha = await bcrypt.hash(String(senha), 10);
    }

    const atualizado = await prisma.usuario.update({
      where: { cpf: onlyDigits(cpf) },
      data,
    });

    res.json(sanitizeUsuario(atualizado));
  } catch (error: any) {
    console.error('Erro no PUT /usuarios/:cpf:', error);
    if (error?.code === 'P2002') {
      return res.status(409).json({ erro: 'CPF ou e-mail já cadastrado.' });
    }
    if (error?.code === 'P2025') {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar usuário.' });
  }
};

// ---------------------- DELETE /usuarios/:cpf ----------------------
export const deletarUsuario = async (req: Request, res: Response) => {
  const { cpf } = req.params;
  try {
    await prisma.usuario.delete({ where: { cpf: onlyDigits(cpf) } });
    res.json({ mensagem: 'Usuário removido com sucesso.' });
  } catch (error: any) {
    console.error('Erro no DELETE /usuarios/:cpf:', error);
    if (error?.code === 'P2025') {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
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

    const cpfLimp = onlyDigits(identificador);
    const email = toNullableLowerCase(identificador);

    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          ...(cpfLimp ? [{ cpf: cpfLimp }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const ok = await bcrypt.compare(String(senha), usuario.senha);
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { cpf: usuario.cpf, tipo: usuario.tipo },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '8h' }
    );

    res.json({ usuario: sanitizeUsuario(usuario), tipo: usuario.tipo, token });
  } catch (error) {
    console.error('Erro no POST /usuarios/login:', error);
    res.status(500).json({ erro: 'Erro no login.' });
  }
};

// =================================================================
// ===============  NOVO: Upload de Avatar do Usuário  ==============
// =================================================================

// Garante que a pasta existe
const AVATAR_DIR = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const cpf = onlyDigits(req.params.cpf || 'user');
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.png';
    const filename = `${cpf}-${Date.now()}${safeExt}`;
    cb(null, filename);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (/^image\/(png|jpe?g|webp)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error('Tipo de arquivo inválido. Use PNG, JPG, JPEG ou WEBP.'));
};

export const uploadAvatarMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
}).single('avatar');

// Handler do upload
export const atualizarAvatar = async (req: Request, res: Response) => {
  try {
    const cpf = onlyDigits(req.params.cpf);
    if (!cpf) return res.status(400).json({ erro: 'CPF inválido.' });

    if (!req.file) return res.status(400).json({ erro: 'Arquivo não enviado.' });

    // Monta URL pública (precisa do static no app)
    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;

    const atualizado = await prisma.usuario.update({
      where: { cpf },
      data: { avatar: publicUrl },
    });

    return res.json({
      mensagem: 'Avatar atualizado com sucesso.',
      avatar: publicUrl,
      usuario: sanitizeUsuario(atualizado),
    });
  } catch (error: any) {
    console.error('Erro no POST /usuarios/:cpf/avatar:', error);
    if (error?.code === 'P2025') {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.status(500).json({ erro: 'Erro ao atualizar avatar.' });
  }
};
