// src/routes/filial.routes.ts
import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// Helpers
const normUF = (uf?: string) => (uf ?? '').trim().toUpperCase();
const isBlank = (v: unknown) => !String(v ?? '').trim();
const slugify = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '-');
const makeSlug = (nome: string, uf: string) => `${slugify(nome)}-${uf.toLowerCase()}`;

/**
 * GET /api/filiais
 */
router.get('/', async (_req, res) => {
  try {
    // seu modelo não tem "cidade" → ordena por nome/uf
    const filiais = await prisma.filial.findMany({
      orderBy: [{ nome: 'asc' }, { uf: 'asc' }],
    });
    res.json(filiais);
  } catch (e) {
    console.error('GET /api/filiais', e);
    res.status(500).json({ message: 'Erro ao listar filiais' });
  }
});

/**
 * GET /api/filiais/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filial = await prisma.filial.findUnique({ where: { id } });
    if (!filial) return res.status(404).json({ message: 'Filial não encontrada' });
    res.json(filial);
  } catch (e) {
    console.error('GET /api/filiais/:id', e);
    res.status(500).json({ message: 'Erro ao buscar filial' });
  }
});

/**
 * POST /api/filiais
 * Aceita: { nome?, uf?, ativa?, corHex?, icone?, cidade? (compat) }
 * - Se "nome" vier vazio mas vier "cidade", usamos `${cidade}-${UF}` como nome
 */
router.post('/', async (req, res) => {
  try {
    const body = req.body ?? {};
    const uf = normUF(body.uf ?? body.estado); // compat com "estado" vindo do front
    if (isBlank(uf) || uf.length !== 2) {
      return res.status(400).json({ message: 'UF (2 letras) é obrigatória.' });
    }

    const nomeInput = String(body.nome ?? '').trim();
    const cidadeCompat = String(body.cidade ?? '').trim(); // pode vir do front
    const nome = nomeInput || (cidadeCompat ? `${cidadeCompat}-${uf}` : '');

    if (isBlank(nome)) {
      return res.status(400).json({ message: 'Nome é obrigatório (ou informe cidade para gerar).' });
    }

    const payload: any = {
      nome,
      uf,
      slug: makeSlug(nome, uf),
      ativa: Boolean(body.ativa ?? true),
    };

    // opcionais se existirem no schema
    if (body.corHex !== undefined) payload.corHex = String(body.corHex);
    if (body.icone  !== undefined) payload.icone  = String(body.icone);

    const nova = await prisma.filial.create({ data: payload });
    res.status(201).json(nova);
  } catch (e: any) {
    console.error('POST /api/filiais', e);
    if (e?.code === 'P2002') return res.status(409).json({ message: 'Slug já existe.' });
    res.status(500).json({ message: 'Erro ao criar filial' });
  }
});

/**
 * PUT /api/filiais/:id
 * Aceita atualização parcial. Se "nome" ou "uf" mudar, recomputa o slug.
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
      if (ufNorm.length !== 2) {
        return res.status(400).json({ message: 'UF deve ter 2 letras.' });
      }
      data.uf = ufNorm;
    }

    // Se nome/uf mudarem, recalcula o slug com os valores novos/atuais
    if (data.nome !== undefined || data.uf !== undefined) {
      const atual = await prisma.filial.findUnique({
        where: { id },
        select: { nome: true, uf: true },
      });
      if (!atual) return res.status(404).json({ message: 'Filial não encontrada' });

      const novoNome = data.nome ?? atual.nome;
      const novoUF   = data.uf   ?? atual.uf;
      data.slug = makeSlug(novoNome, novoUF);
    }

    const upd = await prisma.filial.update({ where: { id }, data });
    res.json(upd);
  } catch (e: any) {
    console.error('PUT /api/filiais/:id', e);
    if (e?.code === 'P2025') return res.status(404).json({ message: 'Filial não encontrada' });
    if (e?.code === 'P2002') return res.status(409).json({ message: 'Slug já existe.' });
    res.status(500).json({ message: 'Erro ao atualizar filial' });
  }
});

/**
 * DELETE /api/filiais/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.filial.delete({ where: { id } });
    res.status(204).end();
  } catch (e: any) {
    console.error('DELETE /api/filiais/:id', e);
    if (e?.code === 'P2025') return res.status(404).json({ message: 'Filial não encontrada' });
    res.status(500).json({ message: 'Erro ao remover filial' });
  }
});

export default router;
