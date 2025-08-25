import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VendaComCliente } from '../modais/ModalReciboVenda';

export function gerarReciboPDF(venda: VendaComCliente) {
  const doc = new jsPDF();
  const margemX = 20;
  let y = 20;

  const formatar = (valor?: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString('pt-BR');

  const formatarCPF = (cpf: string) =>
    cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');

  const cliente = venda.cliente;

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Recibo de Venda', 105, y, { align: 'center' });
  y += 10;

  // Cabeçalho
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const bloco = [
    [`Cliente:`, cliente.nome],
    [`CPF:`, formatarCPF(venda.cpf || '')],
    [`WhatsApp:`, cliente.whatsapp || ''],
    [`Endereço:`, cliente.endereco || ''],
    [`CEP:`, cliente.cep || ''],
    [`Nascimento:`, formatarData(cliente.nascimento || '')],
    [`Data da Venda:`, formatarData(venda.data)],
  ];

  bloco.forEach(([label, valor]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}`, margemX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${valor}`, margemX + 35, y);
    y += 6;
  });

  y += 4;

  // Tabela de itens
  autoTable(doc, {
    startY: y,
    head: [['Produto', 'Qtd', 'Preço', 'Subtotal']],
    body: venda.carrinho.map((item) => [
      `${item.nome}${item.tipo ? ` (${item.tipo})` : ''}`,
      String(item.quantidade),
      formatar(item.precoUnitario),
      formatar(item.subtotal),
    ]),
    margin: { left: margemX, right: margemX },
    styles: { fontSize: 10 },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: 0,
      fontStyle: 'bold',
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Resumo financeiro
  doc.setFontSize(11);
  const espacador = 40;

  doc.text(`Subtotal:`, margemX, y);
  doc.text(formatar(venda.subtotal), margemX + espacador, y);
  y += 6;

  if (venda.descontoValor > 0) {
    const percentual = venda.descontoPercentual ? `${venda.descontoPercentual}% ` : '';
    const nomeCupom =
      typeof venda.destinoDesconto === 'object'
        ? venda.destinoDesconto?.nome
        : venda.descontoPercentual > 0
        ? 'Cupom'
        : 'Motivo não informado';
    const descricaoCupom = `${percentual}${nomeCupom}`;

    doc.text(`Desconto:`, margemX, y);
    doc.text(`- ${formatar(venda.descontoValor)} (${descricaoCupom})`, margemX + espacador, y);
    y += 6;
  }

  if (venda.frete > 0) {
    doc.text(`Frete:`, margemX, y);
    doc.text(formatar(venda.frete), margemX + espacador, y);
    y += 6;
  }

  doc.text(`Forma de Pagamento:`, margemX, y);
  doc.text(venda.forma_pagamento, margemX + espacador, y);
  y += 10;

  // Total final
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Final: ${formatar(venda.totalFinal)}`, 105, y, {
    align: 'center',
  });

  y += 16;

  // Mensagem final centralizada
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');

  const tipo = venda.carrinho[0]?.tipo || '';
  const precoUnit = venda.carrinho[0]?.precoUnitario || 0;

  const mensagens = [
    `Cada caixa com ${tipo} saiu por ${formatar(precoUnit)}`,
  ];

  if (venda.descontoValor > 0) {
    mensagens.push(`Você economizou ${formatar(venda.descontoValor)} nesta compra.`);
  }

 mensagens.push('Obrigado por comprar com a gente! =)');

  mensagens.forEach((linha) => {
    doc.text(linha, 105, y, { align: 'center' });
    y += 6;
  });

  // Nome do arquivo
  const nomeArquivo = `${cliente.nome.replace(/\s/g, '')}-${formatarData(venda.data).replace(/\//g, '-')}.pdf`;
  doc.save(nomeArquivo);
}
