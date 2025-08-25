// src/app.ts
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

// Rotas do domínio
import clienteRoutes from './routes/cliente.routes';
import vendaRoutes from './routes/venda.routes';
import produtoEstoqueRoutes from './routes/produtoEstoque.routes';
import usuarioRoutes from './routes/usuario.routes';
import membroRoutes from './routes/membro.routes';
import filialRoutes from './routes/filial.routes';
import estoqueRoutes from './routes/estoque.routes';
import categoriaEstoqueRoutes from './routes/categoriaEstoque.routes'; // ✅ Adicionado

// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

// (opcionais) utilitários para produção
// import compression from 'compression';
// import morgan from 'morgan';

const app = express();

// Se estiver atrás de proxy (Railway/Render/Heroku/NGINX), habilite:
app.set('trust proxy', 1);

// Body parsers com limite aumentado
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// CORS — ajuste origin conforme necessidade
app.use(
  cors({
    origin: true, // ou ['http://localhost:5173', 'https://seu-dominio.com']
    credentials: true,
  })
);

// (opcionais) middlewares úteis
// app.use(compression());
// app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Arquivos estáticos (uploads)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Rotas de negócio
app.use('/api/clientes', clienteRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/produtoestoque', produtoEstoqueRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/membros', membroRoutes);
app.use('/api/filiais', filialRoutes);
app.use('/api/estoques', estoqueRoutes);
app.use('/api/categoriaestoque', categoriaEstoqueRoutes); // ✅ Agora registrada

// Health check simples
app.get('/api/ping', (_: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Servidor online!' });
});

// 404 — rota não encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Handler global de erros
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Erro inesperado:', err);
  }

  const status = (err as any)?.statusCode || 500;
  const mensagem =
    (err as any)?.message ||
    (status === 500 ? 'Erro interno do servidor.' : 'Falha na requisição.');

  res.status(status).json({ erro: mensagem });
});

export default app;
