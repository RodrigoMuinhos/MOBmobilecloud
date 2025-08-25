import express from 'express';
import {
  listarMembros,
  salvarMembro,
  atualizarMembro,
  deletarMembro,
} from '../controllers/membro.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Membros
 *   description: Gerenciamento da equipe (membros extras)
 */

/**
 * @swagger
 * /membros:
 *   get:
 *     summary: Lista todos os membros
 *     tags: [Membros]
 *     responses:
 *       200:
 *         description: Lista de membros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Membro'
 */
router.get('/', listarMembros);

/**
 * @swagger
 * /membros:
 *   post:
 *     summary: Cria ou atualiza um membro
 *     tags: [Membros]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Membro'
 *     responses:
 *       201:
 *         description: Membro criado ou atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Membro'
 */
router.post('/', salvarMembro);

/**
 * @swagger
 * /membros/{id}:
 *   put:
 *     summary: Atualiza um membro existente
 *     tags: [Membros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do membro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Membro'
 *     responses:
 *       200:
 *         description: Membro atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Membro'
 */
router.put('/:id', atualizarMembro);

/**
 * @swagger
 * /membros/{id}:
 *   delete:
 *     summary: Remove um membro
 *     tags: [Membros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do membro
 *     responses:
 *       204:
 *         description: Membro deletado com sucesso
 */
router.delete('/:id', deletarMembro);

export default router;
