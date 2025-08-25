// src/routes/usuario.routes.ts
import { Router } from 'express';
import {
  listarUsuarios,
  obterUsuario,
  salvarUsuario,
  atualizarUsuario,
  deletarUsuario,
  loginUsuario,
  uploadAvatarMiddleware,
  atualizarAvatar,
} from '../controllers/usuario.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gerenciamento de usuários (admin, filiado, vendedor)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *         email:
 *           type: string
 *           nullable: true
 *         tipo:
 *           type: string
 *           enum: [adm, vendedor, filiado]
 *         cidade:
 *           type: string
 *           nullable: true
 *         cpf:
 *           type: string
 *           description: Somente dígitos
 *         nascimento:
 *           type: string
 *           nullable: true
 *           description: 'Ex.: "1990-05-20"'
 *         whatsapp:
 *           type: string
 *           nullable: true
 *           description: Somente dígitos
 *         avatar:
 *           type: string
 *           nullable: true
 *
 *     CriarUsuarioInput:
 *       type: object
 *       required: [nome, senha, tipo, cpf]
 *       properties:
 *         nome: { type: string }
 *         email: { type: string, nullable: true }
 *         senha: { type: string }
 *         tipo: { type: string, enum: [adm, vendedor, filiado] }
 *         cidade: { type: string, nullable: true }
 *         cpf: { type: string, description: "Somente dígitos" }
 *         nascimento: { type: string, nullable: true }
 *         whatsapp: { type: string, nullable: true, description: "Somente dígitos" }
 *         avatar: { type: string, nullable: true }
 *
 *     AtualizarUsuarioInput:
 *       type: object
 *       properties:
 *         nome: { type: string }
 *         email: { type: string, nullable: true }
 *         senha: { type: string }
 *         tipo: { type: string, enum: [adm, vendedor, filiado] }
 *         cidade: { type: string, nullable: true }
 *         nascimento: { type: string, nullable: true }
 *         whatsapp: { type: string, nullable: true, description: "Somente dígitos" }
 *         avatar: { type: string, nullable: true }
 *
 *     LoginRequest:
 *       type: object
 *       required: [identificador, senha]
 *       properties:
 *         identificador:
 *           type: string
 *           description: CPF (somente dígitos) ou e-mail
 *         senha:
 *           type: string
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 *         tipo:
 *           type: string
 *           enum: [adm, vendedor, filiado]
 *         token:
 *           type: string
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       500:
 *         description: Erro ao buscar usuários
 *
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarUsuarioInput'
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: CPF ou e-mail já cadastrado
 */

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Realiza login com CPF ou e-mail
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Parâmetros ausentes
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro no login
 */

/**
 * @swagger
 * /usuarios/{cpf}:
 *   get:
 *     summary: Obtém um usuário pelo CPF
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         description: Somente dígitos
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *
 *   put:
 *     summary: Atualiza os dados de um usuário pelo CPF
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         description: Somente dígitos
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarUsuarioInput'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: CPF ou e-mail já cadastrado
 *
 *   delete:
 *     summary: Remove um usuário pelo CPF
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         description: Somente dígitos
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * @swagger
 * /usuarios/{cpf}/avatar:
 *   post:
 *     summary: Atualiza o avatar do usuário
 *     tags: [Usuários]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         description: CPF do usuário (somente dígitos)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar atualizado com sucesso
 *       400:
 *         description: CPF inválido ou arquivo não enviado
 *       404:
 *         description: Usuário não encontrado
 */

// === Ordem importa: /login antes de /:cpf
router.get('/', listarUsuarios);
router.post('/login', loginUsuario);
router.get('/:cpf', obterUsuario);
router.post('/', salvarUsuario);
router.put('/:cpf', atualizarUsuario);
router.delete('/:cpf', deletarUsuario);

// === Novo endpoint de upload de avatar ===
router.post('/:cpf/avatar', uploadAvatarMiddleware, atualizarAvatar);

export default router;
