// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const mkSlug = (nome: string, uf: string) =>
  `${nome}-${uf}`
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // tira acentos
    .toLowerCase()
    .replace(/\s+/g, '-')      // espaços -> hífen
    .replace(/[^a-z0-9-]/g, ''); // só letras/números/hífen

async function upsertFilial(nome: string, uf: string) {
  const slug = mkSlug(nome, uf);
  return prisma.filial.upsert({
    where: { slug },
    update: { nome, uf, ativa: true },
    create: { nome, uf, slug, ativa: true },
  });
}

async function main() {
  const belem = await upsertFilial('Belém', 'PA');
  await upsertFilial('Recife', 'PE');
  await upsertFilial('Fortaleza', 'CE');

  await prisma.produtoEstoque.updateMany({
    where: { filialId: undefined },
    data: { filialId: belem.id },
  });

  await prisma.venda.updateMany({
    where: { filialId: undefined },
    data: { filialId: belem.id },
  });

  await prisma.usuario.updateMany({
    where: { filialId: undefined },
    data: { filialId: belem.id },
  });

  console.log('✅ Seed concluído.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
