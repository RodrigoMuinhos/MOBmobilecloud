/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Operações relacionadas aos clientes
 */

import { Router } from 'express';
import {
  listarFiliais,
  obterFilial,
  criarFilial,
  atualizarFilial,
  excluirFilial,
} from '../controllers/filial.controller';

const router = Router();




// 📌 Rotas existentes
/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Lista todos os clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Erro ao buscar clientes
 *
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Cliente já existe
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
 */

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Busca um cliente pelo ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
 *
 *   put:
 *     summary: Atualiza um cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Cliente não encontrado
 *
 *   delete:
 *     summary: Deleta um cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       204:
 *         description: Cliente deletado com sucesso
 *       404:
 *         description: Cliente não encontrado
 */

// 🆕 ROTA: /clientes/status
/**
 * @swagger
 * /clientes/status:
 *   get:
 *     summary: Lista os status disponíveis de cliente
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de status retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/status', (req, res) => {
  const statusDisponiveis = ['Ativo', 'Inativo', 'Pendente', 'Bloqueado'];
  res.json(statusDisponiveis);
});

// 🆕 ROTA: /clientes/modelos-wpp
/**
 * @swagger
 * /clientes/modelos-wpp:
 *   get:
 *     summary: Retorna modelos de mensagens para WhatsApp
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de modelos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   titulo:
 *                     type: string
 *                   conteudo:
 *                     type: string
 */
router.get('/modelos-wpp', (req, res) => {
  const modelos = [
    {
      titulo: 'Mensagem de Boas-Vindas',
      conteudo: 'Olá {{nome}}, seja bem-vindo à MobSupply!',
    },
    {
      titulo: 'Confirmação de Compra',
      conteudo: 'Olá {{nome}}, sua compra foi confirmada com sucesso!',
    },
    {
      titulo: 'Agradecimento',
      conteudo: 'Obrigado pela sua compra, {{nome}}. Até a próxima!',
    },
  ];
  res.json(modelos);
});

// 🔄 Rotas principais
router.get('/', listarFiliais);
router.get('/:id', obterFilial);
router.post('/', criarFilial);
router.put('/:id', atualizarFilial);
router.delete('/:id', excluirFilial);

export default router;
