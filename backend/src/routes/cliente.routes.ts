// src/routes/cliente.routes.ts
/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Operações relacionadas aos clientes
 */

import { Router } from 'express';
import {
  listarClientes,
  buscarClientePorId,
  buscarClientePorCPF,
  salvarCliente,
  atualizarClientePorId,
  deletarClientePorId,
} from '../controllers/cliente.controller';

const router = Router();

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Lista todos os clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
 *   post:
 *     summary: Cadastra um novo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       201:
 *         description: Cliente cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Cliente já existe
 */
router.get('/', listarClientes);
router.post('/', salvarCliente);

/**
 * @swagger
 * /clientes/cpf/{cpf}:
 *   get:
 *     summary: Busca um cliente pelo CPF
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *         description: CPF do cliente (somente números ou com pontuação)
 *     responses:
 *       200:
 *         description: Cliente encontrado com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
router.get('/cpf/:cpf', buscarClientePorCPF); // ⚠️ Antes de "/:id" para não conflitar

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Busca um cliente pelo ID
 *     tags: [Clientes]
 *   put:
 *     summary: Atualiza um cliente por ID
 *     tags: [Clientes]
 *   delete:
 *     summary: Deleta um cliente por ID
 *     tags: [Clientes]
 */
router.get('/:id', buscarClientePorId);
router.put('/:id', atualizarClientePorId);
router.delete('/:id', deletarClientePorId);

/**
 * @swagger
 * /clientes/status:
 *   get:
 *     summary: Lista os status disponíveis de cliente
 *     tags: [Clientes]
 */
router.get('/status', (_req, res) => {
  res.json(['Ativo', 'Inativo', 'Pendente', 'Bloqueado']);
});

/**
 * @swagger
 * /clientes/modelos-wpp:
 *   get:
 *     summary: Retorna modelos de mensagens para WhatsApp
 *     tags: [Clientes]
 */
router.get('/modelos-wpp', (_req, res) => {
  res.json([
    { titulo: 'Mensagem de Boas-Vindas', conteudo: 'Olá {{nome}}, seja bem-vindo à MobSupply!' },
    { titulo: 'Confirmação de Compra', conteudo: 'Olá {{nome}}, sua compra foi confirmada com sucesso!' },
    { titulo: 'Agradecimento', conteudo: 'Obrigado pela sua compra, {{nome}}. Até a próxima!' },
  ]);
});

export default router;
