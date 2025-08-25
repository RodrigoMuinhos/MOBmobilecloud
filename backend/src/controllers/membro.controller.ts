import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { v4 as uuid } from 'uuid';

/**
 * Lista todos os membros.
 */
export const listarMembros = async (_req: Request, res: Response) => {
  try {
    const membros = await prisma.membro.findMany();
    res.json(membros);
  } catch (err) {
    console.error('❌ Erro ao listar membros:', err);
    res.status(500).json({ error: 'Erro ao listar membros.' });
  }
};

/**
 * Cria ou atualiza um membro.
 */
export const salvarMembro = async (req: Request, res: Response) => {
  try {
    const {
      id,
      nome,
      avatar = null,
      usos = 0,
      comissao = 0,
      salvo = true,
      cargo = null
    } = req.body;

    console.log('📦 Dados recebidos no backend:', req.body);

    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({ error: 'Campo "nome" é obrigatório.' });
    }

    let membro;

    if (id) {
      const membroExistente = await prisma.membro.findUnique({ where: { id } });

      if (membroExistente) {
        membro = await prisma.membro.update({
          where: { id },
          data: { nome, avatar, usos, comissao, salvo, cargo },
        });
      } else {
        membro = await prisma.membro.create({
          data: { id, nome, avatar, usos, comissao, salvo, cargo },
        });
      }
    } else {
      membro = await prisma.membro.create({
        data: { id: uuid(), nome, avatar, usos, comissao, salvo, cargo },
      });
    }

    res.status(201).json(membro);
  } catch (err: any) {
    console.error('❌ Erro ao salvar membro:', {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
      cause: err?.cause,
    });
    res.status(500).json({ error: err?.message || 'Erro ao salvar membro.' });
  }
};

/**
 * Atualiza um membro existente por ID.
 */
export const atualizarMembro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, avatar, usos, comissao, salvo, cargo } = req.body;

    const membro = await prisma.membro.update({
      where: { id },
      data: { nome, avatar, usos, comissao, salvo, cargo },
    });

    res.json(membro);
  } catch (err: any) {
    console.error('❌ Erro ao atualizar membro:', {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });
    res.status(500).json({ error: 'Erro ao atualizar membro.' });
  }
};

/**
 * Exclui um membro por ID.
 */
export const deletarMembro = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.membro.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    console.error('❌ Erro ao deletar membro:', {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });
    res.status(500).json({ error: 'Erro ao deletar membro.' });
  }
};
