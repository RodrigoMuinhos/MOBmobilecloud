import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { v4 as uuid } from 'uuid';
import { ClienteCreateSchema, ClienteUpdateSchema } from '../validators/cliente.schema';
import { normalizeCPF, normalizeCEP, normalizeWhatsapp } from '../utils/normalizers';
import { validarCPF } from '../utils/cpf';
import type { Prisma } from '../generated/prisma';

// ---------- Helpers ----------
export const mapIn = (body: any) => {
  const parsed = ClienteCreateSchema.parse(body);

  const cpf = normalizeCPF(parsed.cpf);
  if (!validarCPF(cpf)) {
    throw new Error('CPF inválido');
  }

  return {
    id: parsed.id ?? uuid(),
    nome: parsed.nome.trim(),
    cpf,
    nascimento: parsed.nascimento ? new Date(parsed.nascimento) : null,
    whatsapp: parsed.whatsapp ? normalizeWhatsapp(parsed.whatsapp) : null,
    endereco: parsed.endereco ?? null,
    cep: parsed.cep ? normalizeCEP(parsed.cep) : null,
    estado: parsed.estado ?? parsed.uf ?? null,
    cidade: parsed.cidade ?? null,
    uf: parsed.uf ?? null,
  };
};

// ---------- Listar clientes (simples, sem paginação) ----------
export const listarClientes = async (_req: Request, res: Response) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
    });

    return res.status(200).json(clientes); // ✅ retorna apenas o array direto
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({ erro: 'Erro ao buscar clientes.' });
  }
};

// ---------- Buscar cliente por ID ----------
export const buscarClientePorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });
    return res.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente por ID:', error);
    return res.status(500).json({ erro: 'Erro ao buscar cliente.' });
  }
};

// ---------- Buscar cliente por CPF ----------
export const buscarClientePorCPF = async (req: Request, res: Response) => {
  try {
    const cpfParam = normalizeCPF(req.params.cpf);
    const cliente = await prisma.cliente.findUnique({ where: { cpf: cpfParam } });
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });
    return res.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente por CPF:', error);
    return res.status(500).json({ erro: 'Erro ao buscar cliente por CPF.' });
  }
};

// ---------- Criar novo cliente ----------
export const salvarCliente = async (req: Request, res: Response) => {
  try {
    console.log('\n==== REQ BODY RECEBIDO NO BACKEND ====');
    console.log(JSON.stringify(req.body, null, 2));

    const dataIn = mapIn(req.body);

    const existente = await prisma.cliente.findUnique({
      where: { cpf: dataIn.cpf },
    });

    if (existente) {
      return res.status(409).json({ erro: 'Cliente já cadastrado.' });
    }

    const novoCliente = await prisma.cliente.create({
      data: {
        id: dataIn.id,
        nome: dataIn.nome,
        cpf: dataIn.cpf,
        nascimento: dataIn.nascimento,
        whatsapp: dataIn.whatsapp,
        endereco: dataIn.endereco,
        cep: dataIn.cep,
        estado: dataIn.estado,
        cidade: dataIn.cidade,
      },
    });

    return res.status(201).json(novoCliente);
  } catch (error: any) {
    console.error('Erro ao salvar cliente:', error);
    return res
      .status(400)
      .json({ erro: error?.message || 'Erro ao salvar cliente.' });
  }
};

// ---------- Atualizar cliente por ID ----------
export const atualizarClientePorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = ClienteUpdateSchema.parse(req.body);

    const dataAtualizada: Prisma.ClienteUpdateInput = {
      ...payload,
      nome: payload.nome?.trim(),
      cpf: payload.cpf ? normalizeCPF(payload.cpf) : undefined,
      whatsapp: payload.whatsapp ? normalizeWhatsapp(payload.whatsapp) : undefined,
      nascimento: payload.nascimento ? new Date(payload.nascimento) : undefined,
      cep: payload.cep ? normalizeCEP(payload.cep) : undefined,
      estado: payload.estado ?? (payload as any).uf ?? undefined,
    };

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: dataAtualizada,
    });

    return res.json(clienteAtualizado);
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error);
    return res
      .status(400)
      .json({ erro: error?.message || 'Erro ao atualizar cliente.' });
  }
};

// ---------- Deletar cliente por ID ----------
export const deletarClientePorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    await prisma.cliente.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return res.status(500).json({ erro: 'Erro ao deletar cliente.' });
  }
};
