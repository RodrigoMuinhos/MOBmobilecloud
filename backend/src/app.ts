// backend/src/app.ts
import express, { NextFunction, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { prisma } from './prisma';
import swaggerSpec from './config/swagger';

// middlewares
import { verifyJWT, requireRole } from './middlewares/auth';

// rotas de domínio
import clienteRoutes from './routes/cliente.routes';
import vendaRoutes from './routes/venda.routes';
import produtoEstoqueRoutes from './routes/produtoEstoque.routes';
import usuarioRoutes from './routes/usuario.routes';
import membroRoutes from './routes/membro.routes';
import filialRoutes from './routes/filial.routes';
import estoqueRoutes from './routes/estoque.routes';
import categoriaEstoqueRoutes from './routes/categoriaEstoque.routes';
// auth controller (login simples)
import { loginController } from './controllers/auth.controller';

const app = express();

/* -------------------------------------------------------------------------- */
/*                               Core/Middlewares                              */
/* -------------------------------------------------------------------------- */

app.set('trust proxy', 1);

// ===== CORS =====
const defaults = [
  'http://localhost:3030',
  'http://192.168.40.139:3030',
  // adicione aqui seus front-ends durante o dev:
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];
const envList = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOW = new Set<string>([...defaults, ...envList]);

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/postman
    if (ALLOW.has(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use((req, res, next) => (req.method === 'OPTIONS' ? res.sendStatus(204) : next()));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

/* -------------------------------------------------------------------------- */
/*                                  Infra/Docs                                 */
/* -------------------------------------------------------------------------- */

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Servir uploads (com CORS)
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');
app.use('/uploads', cors(corsOptions), express.static(UPLOADS_DIR));

/* -------------------------------------------------------------------------- */
/*                                   Subrouter                                 */
/* -------------------------------------------------------------------------- */

const api = express.Router();

/** Health p/ Docker + DB (PÚBLICO) */
api.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'db' });
  }
});

/** Ping (PÚBLICO) */
api.get('/ping', (_req, res) => res.json({ status: 'OK', message: 'Servidor online!' }));

/** Diagnóstico de rotas (PÚBLICO) */
api.get('/_routes', (_req, res) => {
  const listRoutes = (router: any, base = ''): Array<{ method: string; path: string }> => {
    const out: Array<{ method: string; path: string }> = [];
    (router.stack || []).forEach((layer: any) => {
      if (layer.route?.path) {
        const methods = Object.keys(layer.route.methods || {});
        methods.forEach((m) => out.push({ method: m.toUpperCase(), path: base + layer.route.path }));
      } else if (layer.name === 'router' && layer.handle?.stack) {
        out.push(...listRoutes(layer.handle, base));
      }
    });
    return out;
  };
  res.json(listRoutes(api, ''));
});

/* ------------------------------- AUTH PÚBLICO ------------------------------- */
api.post('/auth/login', loginController);

// alias de compatibilidade com o front antigo:
api.post('/usuarios/login', loginController);  // <-- ADICIONE ESTA LINHA


/* ------------------------------ Rotas protegidas ----------------------------- */
/** Quem sou eu (protegido) */
api.get('/auth/me', verifyJWT, (req, res) => {
  if (!req.user) return res.status(401).json({ erro: 'Não autenticado' });
  res.json(req.user);
});

/**
 * Bootstrap do 1º usuário:
 * - Se NÃO houver nenhum usuário, permitir POST /api/usuarios SEM JWT.
 * - Caso contrário, exigir verifyJWT + requireRole('adm').
 *
 * Colocamos esse middleware ANTES do verifyJWT+requireRole.
 */
api.use('/usuarios', async (req, res, next) => {
  if (req.method === 'POST') {
    try {
      const count = await prisma.usuario.count();
      if (count === 0) return next(); // libera criação do primeiro usuário
    } catch {
      // se falhar, continua fluxo normal (e possivelmente 401/403 depois)
    }
  }
  // a partir daqui, exige ADM
  return verifyJWT(req, res, (err) => {
    if (err) return next(err);
    return requireRole('adm')(req, res, next);
  });
}, usuarioRoutes);

// Demais domínios: exigem login (qualquer papel). Use scopeWhereByFilial nos controllers para restringir.
api.use('/clientes', verifyJWT, clienteRoutes);
api.use('/vendas', verifyJWT, vendaRoutes);
api.use('/produtoestoque', verifyJWT, produtoEstoqueRoutes);
api.use('/membros', verifyJWT, membroRoutes);
api.use('/filiais', verifyJWT, filialRoutes);
api.use('/estoques', verifyJWT, estoqueRoutes);
api.use('/categoriaestoque', verifyJWT, categoriaEstoqueRoutes);

/* ------------------------------ Montagem em /api ---------------------------- */
app.use('/api', api);

/* --------------------------- Health simples adicional ----------------------- */
app.get('/health', (_: Request, res: Response) => res.status(200).send('ok'));

/* ----------------------------------- 404 ----------------------------------- */
app.use((req: Request, res: Response) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

/* ------------------------------ Error handler ------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') console.error('Erro inesperado:', err);
  const status = (err as any)?.statusCode || 500;
  const mensagem =
    (err as any)?.message || (status === 500 ? 'Erro interno do servidor.' : 'Falha na requisição.');
  res.status(status).json({ erro: mensagem });
});

export default app;
