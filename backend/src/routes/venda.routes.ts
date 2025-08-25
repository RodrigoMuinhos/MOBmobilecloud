/**
 * @swagger
 * tags:
 *   name: Vendas
 *   description: Gerenciamento das vendas realizadas
 */

/**
 * @swagger
 * /vendas:
 *   get:
 *     summary: Lista todas as vendas
 *     tags: [Vendas]
 *     responses:
 *       200:
 *         description: Lista de vendas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venda'
 *       500:
 *         description: Erro ao buscar vendas
 *
 *   post:
 *     summary: Cria uma nova venda
 *     tags: [Vendas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Venda'
 *     responses:
 *       201:
 *         description: Venda criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venda'
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /vendas/{id}:
 *   get:
 *     summary: Buscar venda pelo ID
 *     tags: [Vendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venda retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venda'
 *       404:
 *         description: Venda não encontrada
 *
 *   delete:
 *     summary: Deletar venda pelo ID
 *     tags: [Vendas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venda removida com sucesso
 *       404:
 *         description: Venda não encontrada
 *
 *   put:
 *     summary: Atualizar venda pelo ID
 *     tags: [Vendas]
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
 *             $ref: '#/components/schemas/Venda'
 *     responses:
 *       200:
 *         description: Venda atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venda'
 *       404:
 *         description: Venda não encontrada
 */

import { Router } from 'express';
import {
  salvarVenda,
  listarVendas,
  getVendaById,
  deletarVenda,
  atualizarVenda,
} from '../controllers/venda.controller';

const router = Router();

router.post('/', salvarVenda);
router.get('/', listarVendas);
router.get('/:id', getVendaById);
router.delete('/:id', deletarVenda);
router.put('/:id', atualizarVenda); // ✅ Rota adicionada

export default router;
