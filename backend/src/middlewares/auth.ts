// backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export type PapelUsuario = 'adm' | 'filiado' | 'vendedor';

export type UserToken = {
  id: string;
  cpf: string;
  tipo: PapelUsuario;
  filialId: string | null;
};

// Augmenta o tipo do Express para permitir req.user
declare global {
  namespace Express {
    interface Request {
      user?: UserToken;
    }
  }
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return secret;
}

/**
 * verifyJWT
 * Lê o header Authorization: Bearer <token>, valida e injeta req.user
 */
export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token ausente.' });
  }

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, getSecret()) as JwtPayload & Partial<UserToken>;
    if (!payload || !payload.id || !payload.tipo) {
      return res.status(401).json({ erro: 'Token inválido.' });
    }

    req.user = {
      id: String(payload.id),
      cpf: String(payload.cpf ?? ''),
      tipo: payload.tipo as PapelUsuario,
      filialId: (payload.filialId as string | null) ?? null,
    };

    return next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

/**
 * requireRole(...roles)
 * Garante que o usuário autenticado possui um dos papéis informados
 */
export function requireRole(...roles: PapelUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ erro: 'Não autenticado.' });
    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({ erro: 'Sem permissão.' });
    }
    return next();
  };
}

/**
 * scopeWhereByFilial(where, user)
 * Helper para controllers/serviços: aplica filtro por filial se não for admin
 * Ex.: const where = scopeWhereByFilial({ status: 'pago' }, req.user);
 */
export function scopeWhereByFilial<T extends Record<string, any>>(
  where: T,
  user?: UserToken
): T {
  if (!user) return where;
  if (user.tipo === 'adm') return where;
  return { ...where, filialId: user.filialId } as T;
}

/**
 * signUserToken(payload)
 * Opcional: helper para emitir token no controller de login
 */
export function signUserToken(u: UserToken): string {
  return jwt.sign(
    { id: u.id, cpf: u.cpf, tipo: u.tipo, filialId: u.filialId },
    getSecret(),
    { expiresIn: '8h' }
  );
}
