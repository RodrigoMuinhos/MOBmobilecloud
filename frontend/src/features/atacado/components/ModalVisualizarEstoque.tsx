'use client';
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Distribuidor, Lote } from '../../../types/Distribuidor';

type Props = {
  distribuidor: Distribuidor;
  lote: Lote;
  onClose: () => void;
};

export default function ModalVisualizarEstoque({ distribuidor, lote, onClose }: Props) {
  const { temaAtual } = useTheme();

  const excluirLote = () => {
    if (confirm('Deseja excluir este lote?')) {
      localStorage.removeItem(lote.key);
      onClose();
    }
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    const telefone = distribuidor.telefone || distribuidor.wpp || 'Não informado';
    const estado = distribuidor.uf || distribuidor.estado || 'UF não definida';
    const dataAtual = lote.data;

    // Cabeçalho
    doc.setFillColor('#264D3A');
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255);
    doc.setFontSize(13);
    doc.text('MOBsupply', 14, 13);

    // Informações do distribuidor
    doc.setTextColor(0);
    doc.setFontSize(10);
    const infos = [
      ['Ficha do Distribuidor', 30],
      [`Data do Lote: ${dataAtual}`, 36],
      [`Nome: ${distribuidor.nome}`, 42],
      [`Telefone: ${telefone}`, 48],
      [`Email: ${distribuidor.email}`, 54],
      [`CPF: ${distribuidor.cpf}`, 60],
      [`Studio: ${distribuidor.studio}`, 66],
      [`Endereço: ${distribuidor.endereco}, ${distribuidor.bairro}, ${distribuidor.cidade}/${estado} - CEP ${distribuidor.cep}`, 72]
    ];

    infos.forEach(([texto, y]) => {
      doc.text(String(texto), 14, Number(y), { maxWidth: 180 });
    });

    // Tabela de produtos
    autoTable(doc, {
      startY: 80,
      head: [['Código', 'Modelo', 'Qtd', 'Valor Unit.', 'Subtotal']],
      body: lote.estoques.map((item) => [
        item.codigo,
        item.modelo,
        item.qtd,
        `R$ ${item.valorVenda.toFixed(2)}`,
        `R$ ${(item.qtd * item.valorVenda).toFixed(2)}`
      ]),
      foot: [['', '', `Total: ${lote.totalCaixas}`, '', `R$ ${lote.totalValor.toFixed(2)}`]],
      styles: {
        fontSize: 9,
        textColor: '#000000',
      },
      headStyles: {
        fillColor: '#264D3A',
        textColor: '#FFFFFF',
        fontStyle: 'bold',
      },
      footStyles: {
        fillColor: '#264D3A',
        textColor: '#FFFFFF',
        fontStyle: 'bold',
      },
      theme: 'grid'
    });

    const nomeArquivo = `Ficha-${distribuidor.nome.replace(/\s/g, '_')}.pdf`;
    doc.save(nomeArquivo);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div
        className="w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl text-red-500 hover:text-red-700"
          title="Fechar"
        >
          ❌
        </button>

        <h2 className="text-xl font-bold mb-4">Visualizar Estoque do Lote</h2>

        {/* Informações superiores */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            Data do lote: <strong>{lote.data}</strong>
          </span>
          <div className="flex gap-4 text-sm">
            <button
              onClick={gerarPDF}
              className="text-green-600 hover:underline"
              title="Gerar PDF"
            >
              📄 Gerar PDF
            </button>
            <button
              onClick={excluirLote}
              className="text-red-600 hover:underline"
              title="Excluir lote"
            >
              🗑️ Excluir
            </button>
          </div>
        </div>

        {/* Tabela de produtos */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="border px-2 py-1">Código</th>
                <th className="border px-2 py-1">Modelo</th>
                <th className="border px-2 py-1">Qtd</th>
                <th className="border px-2 py-1">Valor</th>
                <th className="border px-2 py-1">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {lote.estoques.map((item) => (
                <tr key={item.id}>
                  <td className="border px-2 py-1">{item.codigo}</td>
                  <td className="border px-2 py-1">{item.modelo}</td>
                  <td className="border px-2 py-1">{item.qtd}</td>
                  <td className="border px-2 py-1">R$ {item.valorVenda.toFixed(2)}</td>
                  <td className="border px-2 py-1">R$ {(item.qtd * item.valorVenda).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td colSpan={2} className="text-right px-2 py-1">Total</td>
                <td className="px-2 py-1">{lote.totalCaixas}</td>
                <td></td>
                <td className="px-2 py-1">R$ {lote.totalValor.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}