// src/routes/filial.routes.ts
import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

/* ------------------------------- helpers -------------------------------- */
const normUF = (uf?: string) => String(uf ?? '').trim().toUpperCase();
const isBlank = (v: unknown) => String(v ?? '').trim().length === 0;

// slug sem acento, só [a-z0-9-], sem duplos, trim e limitação
const toSlug = (s: string) =>
  s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

const makeSlug = (nome: string, uf: string) => `${toSlug(nome)}-${uf.toLowerCase()}`;

/* ------------------------------ endpoints -------------------------------- */

/** GET /api/filiais */
router.get('/', async (_req, res) => {
  try {
    const filiais = await prisma.filial.findMany({
      // se seu schema não tem "ativa", remova a linha abaixo
      // where: { ativa: true },
      orderBy: [{ nome: 'asc' }, { uf: 'asc' }],
    });
    return res.json(filiais);
  } catch (e) {
    console.error('GET /api/filiais', e);
    return res.status(500).json({ message: 'Erro ao listar filiais' });
  }
});

/** GET /api/filiais/:id */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filial = await prisma.filial.findUnique({ where: { id } });
    if (!filial) return res.status(404).json({ message: 'Filial não encontrada' });
    return res.json(filial);
  } catch (e) {
    console.error('GET /api/filiais/:id', e);
    return res.status(500).json({ message: 'Erro ao buscar filial' });
  }
});

/**
 * POST /api/filiais
 * Body aceita: { nome?, uf?(ou "estado"), ativa?, corHex?, icone?, cidade? }
 * - Se "nome" vier vazio mas vier "cidade", gera nome `${cidade}-${UF}`.
 */
router.post('/', async (req, res) => {
  try {
    const body = req.body ?? {};
    const uf = normUF(body.uf ?? body.estado);
    if (!/^[A-Z]{2}$/.test(uf)) {
      return res.status(400).json({ message: 'UF é obrigatória e deve ter 2 letras (ex.: CE).' });
    }

    const nomeInput = String(body.nome ?? '').trim();
    const cidadeCompat = String(body.cidade ?? '').trim();
    const nome = nomeInput || (cidadeCompat ? `${cidadeCompat}-${uf}` : '');

    if (isBlank(nome)) {
      return res.status(400).json({ message: 'Nome é obrigatório (ou informe "cidade" para gerar).' });
    }

    const data: any = {
      nome,
      uf,
      slug: makeSlug(nome, uf),
      // se seu schema não tem "ativa", remova
      ativa: body.ativa === undefined ? true : !!body.ativa,
    };
    if (body.corHex !== undefined) data.corHex = String(body.corHex);
    if (body.icone  !== undefined) data.icone  = String(body.icone);

    const nova = await prisma.filial.create({ data });
    return res.status(201).json(nova);
  } catch (e: any) {
    console.error('POST /api/filiais', e);
    if (e?.code === 'P2002') {
      return res.status(409).json({ message: 'Já existe uma filial com este slug.' });
    }
    return res.status(500).json({ message: 'Erro ao criar filial' });
  }
});

/**
 * PUT /api/filiais/:id
 * Atualiza parcialmente. Se "nome" ou "uf" mudar, recomputa o slug.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, uf: ufBody, estado, ativa, corHex, icone } = req.body ?? {};

    const data: any = {};
    if (nome   !== undefined) data.nome   = String(nome).trim();
    if (corHex !== undefined) data.corHex = String(corHex);
    if (icone  !== undefined) data.icone  = String(icone);
    if (ativa  !== undefined) data.ativa  = !!ativa;

    if (ufBody !== undefined || estado !== undefined) {
      const ufNorm = normUF(ufBody ?? estado);
      if (!/^[A-Z]{2}$/.test(ufNorm)) {
        return res.status(400).json({ message: 'UF deve ter 2 letras (ex.: CE).' });
      }
      data.uf = ufNorm;
    }

    // recalcula slug se mudou nome ou uf
    if ('nome' in data || 'uf' in data) {
      const atual = await prisma.filial.findUnique({ where: { id }, select: { nome: true, uf: true } });
      if (!atual) return res.status(404).json({ message: 'Filial não encontrada' });

      const novoNome = (data.nome ?? atual.nome) as string;
      const novoUF   = (data.uf   ?? atual.uf)   as string;
      data.slug = makeSlug(novoNome, novoUF);
    }

    const upd = await prisma.filial.update({ where: { id }, data });
    return res.json(upd);
  } catch (e: any) {
    console.error('PUT /api/filiais/:id', e);
    if (e?.code === 'P2025') return res.status(404).json({ message: 'Filial não encontrada' });
    if (e?.code === 'P2002') return res.status(409).json({ message: 'Slug já existe.' });
    return res.status(500).json({ message: 'Erro ao atualizar filial' });
  }
});

/** DELETE /api/filiais/:id */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.filial.delete({ where: { id } });
    return res.status(204).end();
  } catch (e: any) {
    console.error('DELETE /api/filiais/:id', e);
    if (e?.code === 'P2025') return res.status(404).json({ message: 'Filial não encontrada' });
    return res.status(500).json({ message: 'Erro ao remover filial' });
  }
});

export default router;
