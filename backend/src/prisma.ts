// backend/src/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
});

export default prisma;
