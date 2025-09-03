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
 *     summary: Atualizar venda (parcial)
 *     description: |
 *       Atualiza uma venda aceitando **corpo parcial**.
 *
 *       Exemplo de corpo:
 *       {
 *         "status_pagamento": "pago"
 *       }
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
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               status_pagamento:
 *                 type: string
 *                 enum: [pago, pendente]
 *               forma_pagamento:
 *                 type: string
 *               descontoValor:
 *                 type: number
 *               descontoPercentual:
 *                 type: number
 *               frete:
 *                 type: number
 *               acrescimo:
 *                 type: number
 *               totalFinal:
 *                 type: number
 *               observacao:
 *                 type: string
 *           examples:
 *             marcarComoPago:
 *               summary: Atualizar status de pagamento para pago
 *               value:
 *                 status_pagamento: pago
 *     responses:
 *       200:
 *         description: Venda atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venda'
 *       400:
 *         description: Nenhum campo válido enviado
 *       404:
 *         description: Venda não encontrada
 *
 *   patch:
 *     summary: Atualizar venda (parcial) — alternativa ao PUT
 *     description: |
 *       Mesmo comportamento do PUT, aceitando **corpo parcial**.
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
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               status_pagamento:
 *                 type: string
 *                 enum: [pago, pendente]
 *               forma_pagamento:
 *                 type: string
 *               descontoValor:
 *                 type: number
 *               descontoPercentual:
 *                 type: number
 *               frete:
 *                 type: number
 *               acrescimo:
 *                 type: number
 *               totalFinal:
 *                 type: number
 *               observacao:
 *                 type: string
 *           examples:
 *             atualizarFormaPagamento:
 *               summary: Trocar forma de pagamento
 *               value:
 *                 forma_pagamento: "pix"
 *     responses:
 *       200:
 *         description: Venda atualizada com sucesso
 *       400:
 *         description: Nenhum campo válido enviado
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
  atualizarParcialVenda,
  atualizarStatusVenda, // ⬅️ novo
} from '../controllers/venda.controller';

const router = Router();

router.post('/', salvarVenda);
router.get('/', listarVendas);
router.get('/:id', getVendaById);
router.delete('/:id', deletarVenda);

router.put('/:id', atualizarVenda);
router.patch('/:id', atualizarParcialVenda);

// 🔒 endpoint focado só no status
router.patch('/:id/status', atualizarStatusVenda);

export default router;
