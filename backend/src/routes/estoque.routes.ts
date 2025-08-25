// src/routes/estoque.routes.ts
import { Router } from 'express';
import {
  listarEstoques,
  criarEstoque,
  atualizarEstoque,
  deletarEstoque,
  resumoEstoque,
} from '../controllers/estoque.controller';
import { prisma } from '../prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Estoques
 *   description: Gerenciamento de estoques
 */

/**
 * @swagger
 * /estoques:
 *   get:
 *     summary: Lista estoques (opcionalmente filtrando por filial)
 *     tags: [Estoques]
 *     parameters:
 *       - in: query
 *         name: filialId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra estoques por filial
 *     responses:
 *       200:
 *         description: Lista de estoques retornada com sucesso
 */
router.get('/', listarEstoques);

/**
 * @swagger
 * /estoques:
 *   post:
 *     summary: Cria um novo estoque
 *     tags: [Estoques]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, filialId]
 *             properties:
 *               nome:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               observacoes:
 *                 type: string
 *               filialId:
 *                 type: string
 *                 description: ID da filial proprietária do estoque
 *     responses:
 *       201:
 *         description: Estoque criado com sucesso
 */
router.post('/', criarEstoque);

/**
 * @swagger
 * /estoques/{id}:
 *   get:
 *     summary: Obtém um estoque por ID (rota de debug)
 *     tags: [Estoques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estoque encontrado
 *       404:
 *         description: Estoque não existe
 */
router.get('/:id', async (req, res) => {
  try {
    const est = await prisma.estoque.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!est) return res.status(404).json({ erro: 'Não existe' });
    res.json(est);
  } catch (e) {
    console.error('GET /estoques/:id', e);
    res.status(500).json({ erro: 'Erro ao buscar estoque' });
  }
});

/**
 * @swagger
 * /estoques/{id}:
 *   put:
 *     summary: Atualiza um estoque
 *     tags: [Estoques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 *       404:
 *         description: Estoque não encontrado
 */
router.put('/:id', atualizarEstoque);

/**
 * @swagger
 * /estoques/{id}:
 *   delete:
 *     summary: Remove um estoque
 *     tags: [Estoques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Estoque removido com sucesso
 *       404:
 *         description: Estoque não encontrado
 */
router.delete('/:id', deletarEstoque);

/**
 * @swagger
 * /estoques/{id}/resumo:
 *   get:
 *     summary: Retorna o resumo (totais) de um estoque
 *     tags: [Estoques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resumo do estoque retornado com sucesso
 *       404:
 *         description: Estoque não encontrado
 */
router.get('/:id/resumo', resumoEstoque);

export default router;
