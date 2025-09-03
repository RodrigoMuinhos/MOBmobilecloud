// src/app.ts
import express, { NextFunction, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';

// Prisma p/ health DB
import { prisma } from './prisma';

// Rotas de domínio
import clienteRoutes from './routes/cliente.routes';
import vendaRoutes from './routes/venda.routes';
import produtoEstoqueRoutes from './routes/produtoEstoque.routes';
import usuarioRoutes from './routes/usuario.routes';
import membroRoutes from './routes/membro.routes';
import filialRoutes from './routes/filial.routes';
import estoqueRoutes from './routes/estoque.routes';
import categoriaEstoqueRoutes from './routes/categoriaEstoque.routes';

// Auth centralizado
import { verifyJWT, requireRole } from './middlewares/auth';

// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

const app = express();

/* -------------------------------------------------------------------------- */
/*                               Core/Middlewares                              */
/* -------------------------------------------------------------------------- */

app.set('trust proxy', 1);

// ===== CORS =====
// Você pode sobrepor via .env: CORS_ORIGIN="http://localhost:5173,http://192.168.40.139:5173"
const defaults = ['http://localhost:5173', 'http://192.168.40.139:5173'];
const envList = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED = new Set<string>([...defaults, ...envList]);

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/postman
    if (ALLOWED.has(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 204,
  exposedHeaders: ['Content-Disposition'],
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
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || 'db' });
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
        const prefix = base + (layer.regexp?.fast_slash
          ? ''
          : (layer?.regexp?.source || '')
              .replace('^\\', '')
              .replace('\\/?(?=\\/|$)', '')
              .replace(/\\\//g, '/')
              .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ':param')
              .replace(/\^/g, '')
              .replace(/\$$/g, ''));
        out.push(...listRoutes(layer.handle, prefix));
      }
    });
    return out;
  };
  res.json(listRoutes(api, ''));
});

/* --------------------------- AUTH GLOBAL (CENTRAL) -------------------------- */

const PUBLIC_PATHS = new Set<string>(['/health', '/ping', '/usuarios/login', '/_routes']);

// Preflight dentro do subrouter também
api.use((req, res, next) => (req.method === 'OPTIONS' ? res.sendStatus(204) : next()));

// 1) Público → segue; senão exige JWT
api.use((req, res, next) => (PUBLIC_PATHS.has(req.path) ? next() : verifyJWT(req, res, next)));

// 2) Gate admin para /usuarios (exceto login) + bootstrap do 1º usuário
api.use(async (req, res, next) => {
  if (req.path === '/usuarios/login') return next();

  if (req.method === 'POST' && req.path === '/usuarios') {
    try {
      const count = await prisma.usuario.count();
      if (count === 0) return next();
    } catch {
      /* ignore e segue p/ gate normal */
    }
  }

  if (req.path.startsWith('/usuarios')) return requireRole('adm')(req, res, next);
  next();
});

/** Quem sou eu (protegido) */
api.get('/auth/me', (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ erro: 'Não autenticado' });
  res.json(req.user);
});

/* ------------------------------- Rotas de negócio ------------------------------- */
api.use('/clientes', clienteRoutes);
api.use('/vendas', vendaRoutes);
api.use('/produtoestoque', produtoEstoqueRoutes);
api.use('/usuarios', usuarioRoutes);
api.use('/membros', membroRoutes);
api.use('/filiais', filialRoutes);
api.use('/estoques', estoqueRoutes);
api.use('/categoriaestoque', categoriaEstoqueRoutes);

/* ------------------------------ Montagem em /api ------------------------------ */
app.use('/api', api);

/* --------------------------- Health simples adicional -------------------------- */
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
