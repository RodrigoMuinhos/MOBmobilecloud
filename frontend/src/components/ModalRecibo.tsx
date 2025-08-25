import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Venda } from '../types/banco';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

type ModalReciboProps = {
  vendaSelecionada: Venda;
  onConfirmar: () => void;
  onCancelar: () => void;
};

const ModalRecibo: React.FC<ModalReciboProps> = ({
  vendaSelecionada,
  onConfirmar,
  onCancelar,
}) => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.recibo;

  const {
    cliente,
    produtos,
    subtotal,
    descontoValor,
    destinoDesconto,
    frete,
    total,
    dataVenda,
    formaPagamento,
  } = vendaSelecionada;

  const reciboRef = useRef<HTMLDivElement>(null);

  const dataFormatada = !isNaN(Date.parse(dataVenda))
    ? new Date(dataVenda).toLocaleDateString('pt-BR')
    : 'Data inválida';

  const horaFormatada = !isNaN(Date.parse(dataVenda))
    ? new Date(dataVenda).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : 'Hora inválida';

  const gerarPDF = () => {
    if (reciboRef.current) {
      html2pdf()
        .from(reciboRef.current)
        .set({
          margin: 0.5,
          filename: `Recibo_${cliente.nome}_${dataFormatada}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        })
        .save();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative"
        style={{ color: temaAtual.texto }}
      >
        <div ref={reciboRef} className="p-6 text-sm text-black font-sans bg-white">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <img src="/logo.png" alt="Logo" className="h-12" />
            <h2 className="text-xl font-bold text-green-800 text-right">{t.titulo}</h2>
          </div>

          {/* Dados do cliente */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <p><strong>{t.cliente}:</strong> {cliente.nome}</p>
            <p><strong>{t.cpf}:</strong> {cliente.cpf}</p>
            <p><strong>{t.data}:</strong> {dataFormatada}</p>
            <p><strong>{t.hora}:</strong> {horaFormatada}</p>
            <p><strong>{t.pagamento}:</strong> {formaPagamento}</p>
            {destinoDesconto && (
              <p><strong>{t.descontoPara}:</strong> {destinoDesconto}</p>
            )}
          </div>

          {/* Tabela de produtos */}
          <table className="w-full text-xs border-t border-b mb-4">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 text-left">{t.produto}</th>
                <th className="py-2 text-center">{t.qtd}</th>
                <th className="py-2 text-center">{t.unitario}</th>
                <th className="py-2 text-center">{t.subtotal}</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-1">{item.marca} / {item.nome}</td>
                  <td className="text-center py-1">{item.quantidade}</td>
                  <td className="text-center py-1">R$ {item.preco.toFixed(2)}</td>
                  <td className="text-center py-1">
                    R$ {(item.quantidade * item.preco).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totais */}
          <div className="text-sm text-right space-y-1 pr-1">
            <p><strong>{t.subtotalTotal}:</strong> R$ {subtotal.toFixed(2)}</p>
            <p><strong>{t.desconto}:</strong> - R$ {descontoValor.toFixed(2)}</p>
            <p><strong>{t.frete}:</strong> + R$ {frete.toFixed(2)}</p>
            <p className="font-bold text-lg text-green-700 border-t pt-2">
              {t.valorTotal}: R$ {total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-wrap justify-end gap-3 mt-6">
          <button
            onClick={gerarPDF}
            className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800"
          >
            {t.gerarPDF}
          </button>
          <button
            onClick={onCancelar}
            className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            {t.cancelar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRecibo;
