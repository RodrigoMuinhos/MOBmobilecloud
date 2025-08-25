// src/routes/produtoEstoque.routes.ts

/**
 * @swagger
 * tags:
 *   name: ProdutoEstoque
 *   description: Gerenciamento de produtos por estoque/filial
 */

import { Router } from 'express';
import {
  listarEstoqueComCategorias,
  listarEstoque,              // <- /raw
  salvarProdutoEstoque,
  atualizarProdutoEstoque,
  deletarProdutoEstoque,
  substituirProdutoEstoque,
  excluirPorCategoriaTipo,
  criarCategoria,
  listarCategorias,
} from '../controllers/produtoEstoque.controller';

const router = Router();

/**
 * @swagger
 * /produtoestoque:
 *   get:
 *     summary: Lista produtos (achatado), com filtros opcionais
 *     tags: [ProdutoEstoque]
 *     parameters:
 *       - in: query
 *         name: estoqueId
 *         required: false
 *         schema: { type: string }
 *         description: Filtra por um estoque específico
 *       - in: query
 *         name: filialId
 *         required: false
 *         schema: { type: string }
 *         description: Filtra por filial (via relação do estoque)
 *     responses:
 *       200:
 *         description: Lista achatada de produtos
 */
router.get('/', listarEstoqueComCategorias);

/**
 * @swagger
 * /produtoestoque/raw:
 *   get:
 *     summary: Lista crua (sem achatar), com filtros opcionais
 *     tags: [ProdutoEstoque]
 *     parameters:
 *       - in: query
 *         name: estoqueId
 *         required: false
 *         schema: { type: string }
 *       - in: query
 *         name: filialId
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista crua de produtos
 */
router.get('/raw', listarEstoque);

/**
 * @swagger
 * /produtoestoque:
 *   post:
 *     summary: Cria um produto em um estoque
 *     tags: [ProdutoEstoque]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, estoqueId]
 *             properties:
 *               id: { type: string }
 *               nome: { type: string }
 *               codigo: { type: string }
 *               marca: { type: string }
 *               tipo: { type: string }
 *               preco_compra: { type: number }
 *               preco_venda_unidade: { type: number }
 *               preco_venda_caixa: { type: number }
 *               quantidade_em_estoque: { type: number }
 *               unidades_por_caixa: { type: number }
 *               caixas: { type: number }
 *               categoriaId: { type: string }
 *               estoqueId: { type: string }
 *     responses:
 *       201:
 *         description: Produto criado
 *       400:
 *         description: Requisição inválida (ex. nome/estoqueId ausentes)
 *       404:
 *         description: Estoque não encontrado
 *       409:
 *         description: Conflito (ex. código já usado no estoque)
 */
router.post('/', salvarProdutoEstoque);

/**
 * @swagger
 * /produtoestoque/substituir:
 *   put:
 *     summary: Substitui todos os itens do estoque informado
 *     tags: [ProdutoEstoque]
 *     parameters:
 *       - in: query
 *         name: estoqueId
 *         required: false
 *         schema: { type: string }
 *         description: Se informado, apaga e recria apenas deste estoque
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *     responses:
 *       200:
 *         description: Estoque substituído com sucesso
 */
router.put('/substituir', substituirProdutoEstoque);

/**
 * @swagger
 * /produtoestoque/grupo:
 *   delete:
 *     summary: Exclui itens por marca e tipo (opcionalmente por estoque)
 *     tags: [ProdutoEstoque]
 *     parameters:
 *       - in: query
 *         name: marca
 *         schema: { type: string }
 *         required: true
 *       - in: query
 *         name: tipo
 *         schema: { type: string }
 *         required: true
 *       - in: query
 *         name: estoqueId
 *         schema: { type: string }
 *         required: false
 *     responses:
 *       200:
 *         description: Itens excluídos com sucesso
 */
router.delete('/grupo', excluirPorCategoriaTipo);

/**
 * @swagger
 * /produtoestoque/categorias:
 *   get:
 *     summary: Lista categorias (marca + tipo)
 *     tags: [ProdutoEstoque]
 *     parameters:
 *       - in: query
 *         name: filialId
 *         required: false
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/categorias', listarCategorias);

/**
 * @swagger
 * /produtoestoque/categorias:
 *   post:
 *     summary: Cria uma categoria (marca + tipo)
 *     tags: [ProdutoEstoque]
 *     description: Aceita **marca** ou **categoria** como sinônimos para o nome da marca.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marca: { type: string, description: "ou use 'categoria'" }
 *               categoria: { type: string, description: "sinônimo de 'marca'" }
 *               tipo: { type: string }
 *               filialId: { type: string }
 *             example:
 *               categoria: "VX"
 *               tipo: "RL"
 *               filialId: "uuid-da-filial"
 *     responses:
 *       200:
 *         description: Categoria criada (idempotente)
 */
router.post('/categorias', criarCategoria);

/**
 * @swagger
 * /produtoestoque/{id}:
 *   put:
 *     summary: Atualiza um produto do estoque por ID
 *     tags: [ProdutoEstoque]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       404:
 *         description: Produto/estoque não encontrado
 *       409:
 *         description: Conflito (ex. código já usado no estoque)
 *   delete:
 *     summary: Deleta um produto do estoque por ID
 *     tags: [ProdutoEstoque]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Produto removido com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.put('/:id', atualizarProdutoEstoque);
router.delete('/:id', deletarProdutoEstoque);

export default router;
