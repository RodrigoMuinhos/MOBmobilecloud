import { Router } from 'express';
import { verifyJWT, requireRole } from '../middlewares/auth';

// importe seus routers já existentes
import usuarioRoutes from './usuario.routes';
import vendaRoutes from './venda.routes';
import clienteRoutes from './cliente.routes';
import estoqueRoutes from './estoque.routes';
import produtoEstoqueRoutes from './produtoEstoque.routes';
import categoriaEstoqueRoutes from './categoriaEstoque.routes';
import filialRoutes from './filial.routes';
import membroRoutes from './membro.routes';

const router = Router();

/**
 * Whitelist de rotas públicas DENTRO do prefixo onde o index será montado.
 * Se você montar o index com `app.use('/api', router)`,
 * aqui os caminhos são relativos a /api (ou seja: '/usuarios/login', não '/api/usuarios/login').
 */
const PUBLIC_PATHS = new Set<string>([
  '/usuarios/login',
  '/health',
  // adicione aqui outras rotas públicas se existirem
]);

// Auth global com whitelist
router.use((req, res, next) => {
  if (PUBLIC_PATHS.has(req.path)) return next();
  return verifyJWT(req, res, next);
});

/**
 * Gate de admin para o namespace /usuarios (exceto /usuarios/login)
 * Requer que o verifyJWT já tenha rodado (acima), então req.user está disponível.
 */
router.use('/usuarios', (req, res, next) => {
  if (req.path === '/login') return next(); // público
  return requireRole('adm')(req, res, next);
});

// Monte todos os routers existentes (sem alterar dentro deles)
router.use(usuarioRoutes);
router.use(vendaRoutes);
router.use(clienteRoutes);
router.use(estoqueRoutes);
router.use(produtoEstoqueRoutes);
router.use(categoriaEstoqueRoutes);
router.use(filialRoutes);
router.use(membroRoutes);

export default router;
