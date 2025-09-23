// mobile/src/lib/recibo.ts
import jsPDF from 'jspdf';

export type ReciboVenda = {
  vendaId: string;
  data: string;               // ISO ou já formatada
  cliente: { nome: string; cpf?: string | null };
  filial?: string | null;
  forma_pagamento: string;
  parcelas?: number | null;
  itens: Array<{
    nome: string;
    tipo?: string | null;
    quantidade: number;
    precoUnitario: number;
  }>;
  subtotal: number;
  desconto: number;
  frete: number;
  acrescimoCredito?: number;
  total: number;
  observacoes?: string | null;
};

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export async function gerarReciboPDF(data: ReciboVenda): Promise<Blob> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 60;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RECIBO DE VENDA', 40, y);
  y += 24;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Venda: ${data.vendaId}`, 40, y); y += 16;
  doc.text(`Data: ${data.data}`, 40, y); y += 24;

  // Cliente
  doc.setFont('helvetica', 'bold'); doc.text('Cliente', 40, y); y += 14;
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.cliente.nome}${data.cliente.cpf ? ' — CPF: ' + data.cliente.cpf : ''}`, 40, y);
  y += 20;

  if (data.filial) { doc.text(`Filial: ${data.filial}`, 40, y); y += 20; }

  // Itens
  doc.setFont('helvetica', 'bold'); doc.text('Itens', 40, y); y += 14;
  doc.setFont('helvetica', 'normal');
  // Cabeçalho
  doc.text('Produto', 40, y);
  doc.text('Tipo', 290, y, { align: 'right' });
  doc.text('Qtd', 360, y, { align: 'right' });
  doc.text('Preço', 450, y, { align: 'right' });
  doc.text('Subtotal', 540, y, { align: 'right' });
  y += 10;
  doc.line(40, y, 555, y); y += 14;

  data.itens.forEach((it) => {
    const sub = it.precoUnitario * it.quantidade;
    doc.text(it.nome, 40, y);
    doc.text(it.tipo ?? '-', 290, y, { align: 'right' });
    doc.text(String(it.quantidade), 360, y, { align: 'right' });
    doc.text(brl(it.precoUnitario), 450, y, { align: 'right' });
    doc.text(brl(sub), 540, y, { align: 'right' });
    y += 18;
  });

  y += 6;
  doc.line(40, y, 555, y); y += 16;

  // Totais
  const linha = (label: string, v: string) => { doc.text(label, 380, y); doc.text(v, 540, y, { align: 'right' }); y += 18; };
  linha('Subtotal', brl(data.subtotal));
  linha('Desconto', `- ${brl(data.desconto)}`);
  linha('Frete', `+ ${brl(data.frete)}`);
  if (data.acrescimoCredito) linha('Acréscimo (crédito)', `+ ${brl(data.acrescimoCredito)}`);
  doc.setFont('helvetica', 'bold');
  linha('Total', brl(data.total));
  doc.setFont('helvetica', 'normal');

  y += 6;
  doc.text(`Forma de pagamento: ${data.forma_pagamento}${data.parcelas ? ` (${data.parcelas}x)` : ''}`, 40, y); y += 18;

  if (data.observacoes) {
    y += 8;
    doc.setFont('helvetica', 'bold'); doc.text('Observações:', 40, y); y += 14;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(data.observacoes, 515);
    lines.forEach((l: string) => { doc.text(l, 40, y); y += 14; });
  }

  const blob = doc.output('blob');
  return blob;
}
