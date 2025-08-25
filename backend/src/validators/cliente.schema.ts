// src/validators/cliente.schema.ts
import { z } from 'zod';

export const ClienteCreateSchema = z.object({
  id: z
    .string()
    .uuid()
    .optional(), // ✅ agora o id pode ser omitido; será gerado no backend

  nome: z.string().min(2, 'Nome obrigatório'),
  cpf: z.string().min(11).max(14),
  nascimento: z.union([z.string().datetime().optional(), z.string().optional()]), // aceita string ISO
  whatsapp: z.string().optional(),
  endereco: z.string().optional(),
  cep: z.string().optional(),
  estado: z.string().optional(),
  uf: z.string().optional(),
  cidade: z.string().optional(),
});

export const ClienteUpdateSchema = ClienteCreateSchema.partial();

export type ClienteCreateInput = z.infer<typeof ClienteCreateSchema>;
export type ClienteUpdateInput = z.infer<typeof ClienteUpdateSchema>;
