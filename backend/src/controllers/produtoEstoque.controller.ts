import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { v4 as uuidv4 } from 'uuid';

/* ----------------------- helpers numéricos coerentes ---------------------- */
const toNumber = (v: any): number => (v === null || v === undefined || v === '' ? NaN : Number(v));
const toNonNegInt = (v: any, def = 0): number => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : def;
};
const min1Int = (v: any, def = 1): number => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) && n >= 1 ? n : def;
};
const coercePreco = (v: any, def = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : def;
};

/* ==========================================================================
   GET /api/produtoestoque?estoqueId=...&filialId=...
   Lista produtos (achatado), filtrando por estoque ou por filial
   ========================================================================== */
export const listarEstoqueComCategorias = async (req: Request, res: Response) => {
  try {
    const { estoqueId, filialId } = req.query as { estoqueId?: string; filialId?: string };

    const where =
      estoqueId
        ? { estoqueId: String(estoqueId) }
        : filialId
        ? { estoque: { filialId: String(filialId) } }
        : undefined;

    const produtos = await prisma.produtoEstoque.findMany({
      where,
      select: {
        id: true,
        codigo: true,
        nome: true,
        marca: true,
        tipo: true,
        preco_compra: true,
        preco_venda_unidade: true,
        preco_venda_caixa: true,
        quantidade_em_estoque: true,
        unidades_por_caixa: true,
        criado_em: true,
        categoriaId: true,
        caixas: true,
        filialId: true,
        estoqueId: true,
      },
      orderBy: [{ marca: 'asc' }, { tipo: 'asc' }, { nome: 'asc' }],
    });

    const resposta = produtos.map((p) => ({
      ...p,
      caixas: p.caixas ?? 0,
      filialId: p.filialId ?? null,
    }));

    return res.status(200).json(resposta);
  } catch (error) {
    console.error('listarEstoqueComCategorias', error);
    return res.status(500).json({ erro: 'Erro ao listar estoque' });
  }
};

/* ==========================================================================
   GET /api/produtoestoque/raw?estoqueId=...&filialId=...
   Lista crua (sem achatar)
   ========================================================================== */
export const listarEstoque = async (req: Request, res: Response) => {
  try {
    const { estoqueId, filialId } = req.query as { estoqueId?: string; filialId?: string };

    const where =
      estoqueId
        ? { estoqueId: String(estoqueId) }
        : filialId
        ? { estoque: { filialId: String(filialId) } }
        : {};

    const produtos = await prisma.produtoEstoque.findMany({
      where,
      orderBy: [{ nome: 'asc' }],
    });
    res.status(200).json(produtos);
  } catch (error) {
    console.error('listarEstoque', error);
    res.status(500).json({ erro: 'Erro ao listar estoque' });
  }
};

/* ==========================================================================
   POST /api/produtoestoque
   Aceita: categoriaId OU (marca+tipo) para upsert da categoria.
   Requer: estoqueId. (filialId é herdado do estoque e é usado para a categoria)
   ========================================================================== */
export const salvarProdutoEstoque = async (req: Request, res: Response) => {
  const {
    id,
    nome,
    codigo,
    marca,
    tipo,
    preco_compra,
    preco_venda_unidade,
    preco_venda_caixa,
    quantidade_em_estoque,
    unidades_por_caixa,
    caixas = 0,
    categoriaId,
    estoqueId,
  } = req.body;

  if (!nome?.trim()) return res.status(400).json({ erro: 'Campo nome é obrigatório.' });
  if (!estoqueId) return res.status(400).json({ erro: 'estoqueId é obrigatório.' });

  try {
    // Busca estoque e herda filialId (precisamos dele para a categoria)
    const estoqueIdStr = String(estoqueId);

    const est = await prisma.estoque.findUnique({
      where: { id: estoqueIdStr },
      select: { id: true, filialId: true },
    });

    if (!est) {
      console.warn('[produtoestoque] estoqueId inexistente:', estoqueIdStr);
      return res.status(404).json({ erro: `Estoque não encontrado (${estoqueIdStr}).` });
    }

    if (!est.filialId) {
      console.warn('[produtoestoque] estoque sem filial vinculada:', estoqueIdStr);
      return res.status(400).json({ erro: 'Este estoque não está vinculado a nenhuma filial.' });
    }

    // resolve categoria
    let categoriaIdFinal: string | undefined = categoriaId;
    if (!categoriaIdFinal && (marca || tipo)) {
      const cat = await prisma.categoriaEstoque.upsert({
        where: {
          marca_tipo_filial: {
            marca: String(marca || ''),
            tipo: String(tipo || ''),
            filialId: est.filialId,
          },
        },
        update: {},
        create: {
          marca: String(marca || ''),
          tipo: String(tipo || ''),
          filial: { connect: { id: est.filialId } },
        },
        select: { id: true },
      });
      categoriaIdFinal = cat.id;
    }
    if (!categoriaIdFinal) {
      return res.status(400).json({ erro: 'Informe categoriaId ou (marca e tipo).' });
    }

    /* ------------------- coerção e derivação de quantidades ------------------- */
    const unidades = min1Int(unidades_por_caixa, 1);
    const caixasNum = toNonNegInt(caixas, 0);
    const qtdBody = toNumber(quantidade_em_estoque);
    const qtdFinal =
      Number.isFinite(qtdBody) && qtdBody >= 0 ? Math.trunc(qtdBody) : caixasNum * unidades;
    const caixasFinal =
      Number.isFinite(toNumber(caixas)) && caixasNum >= 0
        ? caixasNum
        : Math.floor(qtdFinal / unidades);

    /* ----------------- coerção e derivação de preços (opcional) ---------------- */
    const precoCaixaNum = coercePreco(preco_venda_caixa, 0);
    const precoUnidBody = coercePreco(preco_venda_unidade, NaN);
    const precoUnidFinal =
      Number.isFinite(precoUnidBody) && precoUnidBody > 0
        ? precoUnidBody
        : unidades > 0
        ? precoCaixaNum / unidades
        : 0;

    const novo = await prisma.produtoEstoque.create({
      data: {
        id: id || uuidv4(),
        nome: String(nome).trim(),
        codigo: String(codigo ?? ''),
        marca: String(marca ?? ''),
        tipo: String(tipo ?? ''),
        preco_compra: coercePreco(preco_compra, 0),
        preco_venda_unidade: precoUnidFinal,
        preco_venda_caixa: precoCaixaNum,
        quantidade_em_estoque: qtdFinal,
        unidades_por_caixa: unidades,
        caixas: caixasFinal,
        categoriaId: categoriaIdFinal,
        estoqueId: estoqueIdStr,
        filialId: est.filialId, // útil p/ relatórios
      },
    });

    res.status(201).json(novo);
  } catch (error: any) {
    console.error('salvarProdutoEstoque', error);
    if (error?.code === 'P2002') {
      // viola @@unique([estoqueId, codigo])
      return res.status(409).json({ erro: 'Código já usado neste estoque.' });
    }
    res.status(500).json({ erro: 'Erro ao salvar produto' });
  }
};

/* ==========================================================================
   PUT /api/produtoestoque/:id
   Atualiza parcialmente; se estoqueId mudar, atualiza filialId coerentemente.
   Reconcilia caixas/unidades/quantidade e preços quando necessário.
   ========================================================================== */
export const atualizarProdutoEstoque = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dados = req.body;
    if (!id) return res.status(400).json({ erro: 'ID do produto não informado.' });

    const existe = await prisma.produtoEstoque.findUnique({ where: { id } });
    if (!existe) return res.status(404).json({ erro: 'Produto não encontrado.' });

    const camposPermitidos = [
      'nome',
      'codigo',
      'marca',
      'tipo',
      'preco_compra',
      'preco_venda_unidade',
      'preco_venda_caixa',
      'quantidade_em_estoque',
      'unidades_por_caixa',
      'caixas',
      'categoriaId',
      'estoqueId',
    ] as const;

    const data: any = {};
    for (const campo of camposPermitidos) {
      if (campo in dados) {
        data[campo] = ((): any => {
          const v = (dados as any)[campo];
          // numéricos viram número quando aplicável
          const n = Number(v);
          if (typeof v === 'number') return v;
          if (!Number.isNaN(n) && v !== '') return n;
          return v;
        })();
      }
    }

    /* -------------------------- reconciliação de estoque ------------------------- */
    const willTouchCaixas = 'caixas' in data;
    const willTouchUnid = 'unidades_por_caixa' in data;
    const willTouchQtd = 'quantidade_em_estoque' in data;

    const unidades = willTouchUnid ? min1Int(data.unidades_por_caixa, 1) : min1Int(existe.unidades_por_caixa, 1);
    const caixas = willTouchCaixas ? toNonNegInt(data.caixas, existe.caixas ?? 0) : toNonNegInt(existe.caixas ?? 0, 0);
    const qtd = willTouchQtd ? toNonNegInt(data.quantidade_em_estoque, existe.quantidade_em_estoque ?? 0) : toNonNegInt(existe.quantidade_em_estoque ?? 0, 0);

    // Se mexeu em caixas ou unidades e não informou quantidade, derive quantidade
    if ((willTouchCaixas || willTouchUnid) && !willTouchQtd) {
      data.quantidade_em_estoque = caixas * unidades;
      data.unidades_por_caixa = unidades; // garante mínimo 1
    }
    // Se mexeu em quantidade e não informou caixas, derive caixas
    if (willTouchQtd && !willTouchCaixas) {
      data.caixas = Math.floor(qtd / unidades);
      data.unidades_por_caixa = unidades; // garante mínimo 1
    }
    // Se só mexeu em unidades (ex.: 5 -> 10), derive quantidade a partir das caixas atuais
    if (willTouchUnid && !willTouchCaixas && !willTouchQtd) {
      data.quantidade_em_estoque = caixas * unidades;
    }

    /* -------------------------- reconciliação de preços -------------------------- */
    const willTouchPrecoCx = 'preco_venda_caixa' in data;
    const willTouchPrecoUn = 'preco_venda_unidade' in data;
    const precoCx = willTouchPrecoCx ? coercePreco(data.preco_venda_caixa, 0) : coercePreco(existe.preco_venda_caixa, 0);
    const precoUn = willTouchPrecoUn ? coercePreco(data.preco_venda_unidade, NaN) : coercePreco(existe.preco_venda_unidade, NaN);

    if (willTouchPrecoCx && !willTouchPrecoUn) {
      data.preco_venda_unidade = unidades > 0 ? precoCx / unidades : 0;
    } else if (!willTouchPrecoCx && willTouchPrecoUn && !Number.isFinite(precoCx)) {
      // Se veio apenas o unitário e não temos caixa confiável, derive o de caixa
      data.preco_venda_caixa = precoUn * unidades;
    }

    // Se estoqueId mudou, herda nova filial
    if (data.estoqueId && data.estoqueId !== existe.estoqueId) {
      const novoEstoque = await prisma.estoque.findUnique({
        where: { id: String(data.estoqueId) },
        select: { filialId: true },
      });
      if (!novoEstoque) return res.status(404).json({ erro: 'Novo estoque não encontrado.' });
      data.filialId = novoEstoque.filialId ?? null;
    }

    const atual = await prisma.produtoEstoque.update({
      where: { id },
      data,
    });

    return res.status(200).json(atual);
  } catch (error: any) {
    console.error('atualizarProdutoEstoque', error);
    if (error?.code === 'P2002') {
      return res.status(409).json({ erro: 'Código já usado neste estoque.' });
    }
    return res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
};

/* ==========================================================================
   DELETE /api/produtoestoque/:id
   ========================================================================== */
export const deletarProdutoEstoque = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.produtoEstoque.delete({ where: { id } });
    res.status(200).json({ mensagem: 'Produto removido com sucesso' });
  } catch (error: any) {
    console.error('deletarProdutoEstoque', error);
    if (error?.code === 'P2025') {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
};

/* ==========================================================================
   PUT /api/produtoestoque/substituir?estoqueId=...
   Substitui TODO o estoque (apenas daquele estoque, se informado).
   Cada item deve conter ao menos: nome, codigo, categoriaId OU (marca+tipo).
   ========================================================================== */
export const substituirProdutoEstoque = async (req: Request, res: Response) => {
  const itens = req.body as any[];
  try {
    const { estoqueId } = req.query as { estoqueId?: string };

    await prisma.produtoEstoque.deleteMany({
      where: estoqueId ? { estoqueId: String(estoqueId) } : undefined,
    });

    const inseridos = [];
    for (const item of itens) {
      if (!item.estoqueId && !estoqueId) {
        throw new Error('Cada item precisa de estoqueId, ou informe ?estoqueId na URL.');
      }
      const estId = String(item.estoqueId ?? estoqueId);

      const est = await prisma.estoque.findUnique({
        where: { id: estId },
        select: { filialId: true },
      });
      if (!est) throw new Error(`Estoque não encontrado: ${estId}`);
      if (!est.filialId) throw new Error(`Estoque ${estId} não está vinculado a nenhuma filial.`);

      // resolve categoria
      let categoriaIdFinal: string | undefined = item.categoriaId;
      if (!categoriaIdFinal && (item.marca || item.tipo)) {
        const cat = await prisma.categoriaEstoque.upsert({
          where: {
            marca_tipo_filial: {
              marca: String(item.marca || ''),
              tipo: String(item.tipo || ''),
              filialId: est.filialId,
            },
          },
          update: {},
          create: {
            marca: String(item.marca || ''),
            tipo: String(item.tipo || ''),
            filial: { connect: { id: est.filialId } },
          },
          select: { id: true },
        });
        categoriaIdFinal = cat.id;
      }
      if (!categoriaIdFinal) {
        throw new Error('Informe categoriaId ou (marca e tipo) para cada item.');
      }

      // coerção/derivação por item
      const unidades = min1Int(item.unidades_por_caixa, 1);
      const caixasNum = toNonNegInt(item.caixas, 0);
      const qtdBody = toNumber(item.quantidade_em_estoque);
      const qtdFinal =
        Number.isFinite(qtdBody) && qtdBody >= 0 ? Math.trunc(qtdBody) : caixasNum * unidades;
      const caixasFinal =
        Number.isFinite(toNumber(item.caixas)) && caixasNum >= 0
          ? caixasNum
          : Math.floor(qtdFinal / unidades);

      const precoCx = coercePreco(item.preco_venda_caixa, 0);
      const precoUnBody = coercePreco(item.preco_venda_unidade, NaN);
      const precoUnFinal =
        Number.isFinite(precoUnBody) && precoUnBody > 0
          ? precoUnBody
          : unidades > 0
          ? precoCx / unidades
          : 0;

      const novo = await prisma.produtoEstoque.create({
        data: {
          id: item.id || uuidv4(),
          nome: String(item.nome).trim(),
          codigo: String(item.codigo ?? ''),
          tipo: String(item.tipo ?? ''),
          marca: String(item.marca ?? ''),
          preco_compra: coercePreco(item.preco_compra, 0),
          preco_venda_unidade: precoUnFinal,
          preco_venda_caixa: precoCx,
          quantidade_em_estoque: qtdFinal,
          unidades_por_caixa: unidades,
          caixas: caixasFinal,
          categoriaId: categoriaIdFinal,
          estoqueId: estId,
          filialId: est.filialId,
        },
      });
      inseridos.push(novo);
    }

    res.status(200).json({ mensagem: 'Estoque atualizado com sucesso!', inseridos });
  } catch (erro: any) {
    console.error('substituirProdutoEstoque', erro);
    res.status(500).json({ erro: erro?.message || 'Erro ao atualizar estoque.' });
  }
};

/* ==========================================================================
   DELETE /api/produtoestoque/grupo?marca=...&tipo=...&estoqueId=...
   Exclui itens por marca/tipo e (opcionalmente) por estoque
   ========================================================================== */
export const excluirPorCategoriaTipo = async (req: Request, res: Response) => {
  const { marca, tipo, estoqueId } = req.query as {
    marca?: string;
    tipo?: string;
    estoqueId?: string;
  };
  if (!marca || !tipo) {
    return res.status(400).json({ erro: 'marca e tipo são obrigatórios.' });
  }

  try {
    await prisma.produtoEstoque.deleteMany({
      where: {
        marca: String(marca),
        tipo: String(tipo),
        ...(estoqueId ? { estoqueId: String(estoqueId) } : {}),
      },
    });

    res.status(200).json({ mensagem: 'Itens excluídos com sucesso.' });
  } catch (error) {
    console.error('excluirPorCategoriaTipo', error);
    res.status(500).json({ erro: 'Erro ao excluir os itens.' });
  }
};

/* ==========================================================================
   GET /api/produtoestoque/categorias?filialId=...
   Lista CategoriaEstoque por filial
   ========================================================================== */
export const listarCategorias = async (req: Request, res: Response) => {
  try {
    const { filialId } = req.query as { filialId?: string };
    const categorias = await prisma.categoriaEstoque.findMany({
      where: filialId ? { filialId: String(filialId) } : undefined,
      orderBy: [{ marca: 'asc' }, { tipo: 'asc' }],
      select: { id: true, marca: true, tipo: true, filialId: true },
    });
    res.json(categorias);
  } catch (e) {
    console.error('listarCategorias', e);
    res.status(500).json({ error: 'Erro ao listar categorias.' });
  }
};

/* ==========================================================================
   POST /api/produtoestoque/categorias
   Cria CategoriaEstoque (marca+tipo) por filial — aceita "marca" OU "categoria"
   Requer filialId
   ========================================================================== */
export const criarCategoria = async (req: Request, res: Response) => {
  const { marca, categoria, tipo, filialId } = req.body || {};
  const marcaFinal = (marca ?? categoria ?? '').toString().trim();
  const tipoFinal = (tipo ?? '').toString().trim();
  const filialIdFinal = (filialId ?? '').toString().trim();

  if (!marcaFinal || !tipoFinal || !filialIdFinal) {
    return res.status(400).json({ error: 'marca/categoria, tipo e filialId são obrigatórios.' });
  }

  try {
    const row = await prisma.categoriaEstoque.upsert({
      where: { marca_tipo_filial: { marca: marcaFinal, tipo: tipoFinal, filialId: filialIdFinal } },
      update: {},
      create: {
        marca: marcaFinal,
        tipo: tipoFinal,
        filial: { connect: { id: filialIdFinal } },
      },
      select: { id: true, marca: true, tipo: true, filialId: true },
    });

    return res.status(200).json(row);
  } catch (error) {
    console.error('criarCategoria', error);
    return res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
};
