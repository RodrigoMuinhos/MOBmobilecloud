import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { PapelUsuario, signUserToken, UserToken } from '../middlewares/auth';

function onlyDigits(s: string) {
  return (s || '').replace(/\D/g, '');
}
function normalizeCPF(s: string) {
  const d = onlyDigits(s);
  return d.length >= 11 ? d : d; // já retorna só números (11+)
}
function toLower<T extends string | null | undefined>(s: T) {
  return (s ?? '').toString().trim().toLowerCase();
}

export async function loginController(req: Request, res: Response) {
  try {
    // aceita: identificador | cpf | email | whatsapp
    const { identificador, cpf, email, whatsapp, senha } = req.body ?? {};
    if (!senha) return res.status(400).json({ erro: 'Informe identificador e senha.' });

    // prioridade: identificador > cpf > email > whatsapp
    let idRaw: string = (identificador ?? cpf ?? email ?? whatsapp ?? '').toString().trim();
    if (!idRaw) return res.status(400).json({ erro: 'Informe identificador e senha.' });

    let user:
      | {
          id: string;
          nome: string;
          cpf: string;
          senha: string | null;
          tipo: string;
          filialId: string | null;
          email: string | null;
          avatar: string | null;
          whatsapp: string | null;
        }
      | null = null;

    // Detecta o tipo do identificador
    if (idRaw.includes('@')) {
      // e-mail
      user = await prisma.usuario.findFirst({
        where: { email: toLower(idRaw) },
        select: { id: true, nome: true, cpf: true, senha: true, tipo: true, filialId: true, email: true, avatar: true, whatsapp: true },
      });
    } else {
      const digits = onlyDigits(idRaw);
      if (digits.length >= 11) {
        // trata como CPF (ou celular com 11 dígitos); prioriza CPF
        user =
          (await prisma.usuario.findUnique({
            where: { cpf: normalizeCPF(digits) },
            select: { id: true, nome: true, cpf: true, senha: true, tipo: true, filialId: true, email: true, avatar: true, whatsapp: true },
          })) ||
          (await prisma.usuario.findFirst({
            where: { whatsapp: digits },
            select: { id: true, nome: true, cpf: true, senha: true, tipo: true, filialId: true, email: true, avatar: true, whatsapp: true },
          }));
      } else {
        // número curto: tenta whatsapp
        user = await prisma.usuario.findFirst({
          where: { whatsapp: digits },
          select: { id: true, nome: true, cpf: true, senha: true, tipo: true, filialId: true, email: true, avatar: true, whatsapp: true },
        });
      }
    }

    if (!user) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    // Comparação de senha (hash bcrypt ou texto puro -> auto-upgrade)
    const saved = user.senha || '';
    let ok = false;
    if (saved.startsWith('$2')) {
      ok = await bcrypt.compare(senha, saved);
    } else {
      ok = senha === saved;
      if (ok) {
        const newHash = await bcrypt.hash(senha, 10);
        await prisma.usuario.update({ where: { id: user.id }, data: { senha: newHash } });
      }
    }
    if (!ok) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const tipoLower = String(user.tipo).toLowerCase() as PapelUsuario;
    const payload: UserToken = {
      id: user.id,
      cpf: user.cpf,
      tipo: tipoLower,
      filialId: user.filialId,
    };
    const token = signUserToken(payload);

    return res.json({
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        cpf: user.cpf,
        tipo: tipoLower,
        filialId: user.filialId,
        avatar: user.avatar,
        email: user.email,
        whatsapp: user.whatsapp,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[loginController] erro:', err);
    return res.status(500).json({ erro: 'Erro ao autenticar.' });
  }
}
