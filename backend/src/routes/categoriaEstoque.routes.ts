// src/routes/categoriaEstoque.routes.ts
import { Router, RequestHandler } from 'express';
import {
  listarCategoriasEstoque,
  criarCategoriaEstoque,
  deletarCategoriaEstoque,
} from '../controllers/categoriaEstoque.controller';

const router = Router();

/**
 * Normaliza o body para o controller:
 * - aceita `categoria` ou `marca`
 * - `filialId` pode ser string vazia -> vira null
 */
const normalizarBodyCriacao: RequestHandler = (req, _res, next) => {
  const b = req.body ?? {};
  const categoria = String(b.categoria ?? b.marca ?? '').trim();
  const tipo = String(b.tipo ?? '').trim();
  const filialRaw = String(b.filialId ?? '').trim();
  req.body = {
    categoria,
    tipo,
    filialId: filialRaw === '' ? null : filialRaw,
  };
  next();
};

/**
 * GET /api/categoriaestoque
 * ?filialId=...
 * Lista categorias (opcional filtrar por filial)
 */
router.get('/', listarCategoriasEstoque);

/**
 * POST /api/categoriaestoque
 * { categoria | marca, tipo, filialId? }
 * Cria uma categoria (ou retorna 409 se já existir)
 */
router.post('/', normalizarBodyCriacao, criarCategoriaEstoque);

/**
 * DELETE /api/categoriaestoque/:id
 * Remove categoria pelo ID
 */
router.delete('/:id', deletarCategoriaEstoque);

export default router;
