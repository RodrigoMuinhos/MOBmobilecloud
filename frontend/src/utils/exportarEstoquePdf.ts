// src/utils/exportarEstoquePdf.ts
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import type { ProdutoEstoqueAPI } from '../types/api/produtoEstoqueApi.types';

type Filtros = { marca?: string | null; tipo?: string | null; busca?: string | null };
type Opcoes = {
  filialNome?: string;
  cidade?: string;
  usuario?: string;
  filtros?: Filtros;
  nomeArquivo?: string;
  temaHeaderHex?: string; // ex.: temaAtual.destaque (#RRGGBB)
};

const brl = (v?: number | null) =>
  Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = (v?: number | null) => Number(v ?? 0).toLocaleString('pt-BR');
const pad = (n: number) => String(n).padStart(2, '0');

function descricaoFiltros(f?: Filtros) {
  if (!f) return '—';
  const parts: string[] = [];
  if (f.marca) parts.push(`Marca: ${f.marca}`);
  if (f.tipo) parts.push(`Tipo: ${f.tipo}`);
  if (f.busca) parts.push(`Busca: "${f.busca}"`);
  return parts.length ? parts.join(' | ') : '—';
}

function hexToRgb(hex?: string): [number, number, number] | undefined {
  if (!hex) return;
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] as [number,number,number] : undefined;
}

export function exportarEstoquePdf(itens: ProdutoEstoqueAPI[], op?: Opcoes) {
  const { filialNome, cidade, usuario, filtros, nomeArquivo, temaHeaderHex } = op || {};

  // A4 retrato
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  // Cabeçalho
  const agora = new Date();
  const dataStr = agora.toLocaleString('pt-BR');

  doc.setFontSize(15);
  doc.text('Relatório de Estoque', 40, 36);

  doc.setFontSize(10);
  let y = 50;
  if (filialNome || cidade) { doc.text(`${filialNome ?? ''}${cidade ? ' - ' + cidade : ''}`, 40, y); y += 14; }
  doc.text(`Gerado em: ${dataStr}`, 40, y); y += 14;
  if (usuario) { doc.text(`Por: ${usuario}`, 40, y); y += 14; }
  doc.text(`Filtros: ${descricaoFiltros(filtros)}`, 40, y);

  // Footer (numeração)
  const addFooter = () => {
    const pages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(
        `Página ${i} de ${pages}`,
        doc.internal.pageSize.getWidth() - 80,
        doc.internal.pageSize.getHeight() - 20
      );
    }
  };

  const headerColor = hexToRgb(temaHeaderHex) ?? [67, 111, 24];

  // ===== TABELA ENXUTA (6 colunas): Código | Nome | Caixas | Un/Cx | Pç Cx | Pç Un =====
  const head = [['Código', 'Nome', 'Caixas', 'Un/Cx', 'Pç Cx', 'Pç Un']];

  let totalUnidades = 0;
  let totalValor = 0;

  // Distintos
  const marcas = new Set<string>();
  const modelos = new Set<string>();

  const body: RowInput[] = itens.map((p) => {
    const unPorCx = Math.max(1, Number(p.unidades_por_caixa ?? 1));
    const qtdUn = Number(p.quantidade_em_estoque ?? 0);
    const precoUn = Number(p.preco_venda_unidade ?? 0);
    const precoCx = Number(p.preco_venda_caixa ?? 0);

    const caixas = Number.isFinite(Number((p as any).caixas))
      ? Number((p as any).caixas)
      : Math.floor(qtdUn / unPorCx);

    totalUnidades += qtdUn;
    totalValor += qtdUn * precoUn;

    const marcaKey = (p.marca ?? '').trim().toLowerCase();
    if (marcaKey) marcas.add(marcaKey);

    const nomeKey = (p.nome ?? '').trim().toLowerCase();
    if (nomeKey) modelos.add(nomeKey);

    return [
      p.codigo ?? '',
      p.nome ?? '',
      num(caixas),
      String(unPorCx),
      brl(precoCx),
      brl(precoUn),
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: y + 22,
    styles: {
      fontSize: 8.4,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
      overflow: 'ellipsize',
      minCellHeight: 13,
      valign: 'middle',
    },
    headStyles: {
      fillColor: headerColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
    },
    columnStyles: {
      0: { cellWidth: 66 },                   // Código
      1: { cellWidth: 220 },                  // Nome
      2: { cellWidth: 56, halign: 'right' },  // Caixas
      3: { cellWidth: 56, halign: 'right' },  // Un/Cx
      4: { cellWidth: 80, halign: 'right' },  // Pç Cx
      5: { cellWidth: 81, halign: 'right' },  // Pç Un
    },
    margin: { left: 18, right: 18 },
    didDrawPage: () => addFooter(),
  });

  // ===== BLOCO: TOTAIS GERAIS DO ESTOQUE (abaixo da tabela) =====
  const yResumo = (doc as any).lastAutoTable.finalY + 12;

  // formatar contagens com rótulos
  const totalUnStr = `${num(totalUnidades)} un.`;
  const totalValorStr = brl(totalValor);
  const marcasStr = `${marcas.size} ${marcas.size === 1 ? 'marca' : 'marcas'}`;
  const modelosStr = `${modelos.size} ${modelos.size === 1 ? 'modelo' : 'modelos'}`;

  autoTable(doc, {
    head: [[ 'Totais Gerais do Estoque', '', '', '', '' ]],
    body: [[
      `Valor Total\n${totalValorStr}`,
      `Total de Unidades\n${totalUnStr}`,
      `Marcas Cadastradas\n${marcasStr}`,
      `Modelos Cadastrados\n${modelosStr}`,
      '', // célula vazia só para ajustar grid (5 colunas)
    ]],
    startY: yResumo,
    styles: {
      fontSize: 9.8,
      cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
      overflow: 'linebreak',
      minCellHeight: 22,
      valign: 'middle',
    },
    headStyles: {
      fillColor: headerColor,
      textColor: [255,255,255],
      fontSize: 10.5,
      halign: 'left',
    },
    bodyStyles: {
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 160 },
      1: { cellWidth: 150 },
      2: { cellWidth: 130 },
      3: { cellWidth: 170 },
      4: { cellWidth: 0 }, // ocupa o restante se sobrar
    },
    margin: { left: 18, right: 18 },
    tableLineColor: [220,220,220],
    tableLineWidth: 0.5,
    didDrawPage: () => addFooter(),
  });

  const nome = nomeArquivo ?? `estoque_${(filialNome ?? 'geral')
    .toLowerCase().replace(/\s+/g, '-')}_${agora.getFullYear()}-${pad(agora.getMonth()+1)}-${pad(agora.getDate())}_${pad(agora.getHours())}-${pad(agora.getMinutes())}.pdf`;

  doc.save(nome);
}
