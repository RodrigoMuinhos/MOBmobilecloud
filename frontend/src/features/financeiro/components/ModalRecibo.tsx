'use client';

import React from 'react';
import { ProdutoAPI } from '../../../types/api/produtoApi.types'; // ✅ tipo atualizado
import { useTheme } from '../../../context/ThemeContext';
import { useIdioma } from '../../../context/IdiomaContext';
import { FaTimes } from 'react-icons/fa';

type ModalReciboProps = {
  onClose?: () => void;
  clienteNome: string;
  clienteCPF: string;
  clienteWpp: string;
  clienteEndereco: string;
  clienteCep: string;
  clienteNascimento?: string;
  dataVenda: string;
  produtos: ProdutoAPI[]; // ✅ alterado
  subtotal: number;
  descontoPercentual: number;
  descontoValor: number;
  destinoDesconto: string;
  frete: number;
  acrescimo: number;
  formaPagamento: string;
};

const ModalRecibo: React.FC<ModalReciboProps> = ({
  onClose,
  clienteNome,
  clienteCPF,
  clienteWpp,
  clienteEndereco,
  clienteCep,
  clienteNascimento,
  dataVenda,
  produtos,
  subtotal,
  descontoPercentual,
  descontoValor,
  destinoDesconto,
  frete,
  acrescimo,
  formaPagamento,
}) => {
  const { temaAtual } = useTheme();
  const { idioma } = useIdioma();
  const t = idioma.recibo || idioma.relatorio;

  const totalFinal = subtotal - descontoValor + frete + acrescimo;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 w-[95%] md:w-[700px] max-h-[90vh] overflow-y-auto transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-lg z-50"
        style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recibo</h2>
          <button onClick={onClose} className="text-red-500">
            <FaTimes />
          </button>
        </div>

        <div className="mb-4">
          <p><strong>{t.nome}:</strong> {clienteNome}</p>
          <p><strong>{t.cpf}:</strong> {clienteCPF}</p>
          <p><strong>WhatsApp:</strong> {clienteWpp}</p>
          <p><strong>{t.endereco}:</strong> {clienteEndereco} - {clienteCep}</p>
          {clienteNascimento && <p><strong>{t.nascimento}:</strong> {clienteNascimento}</p>}
          <p><strong>{t.compraEm}:</strong> {new Date(dataVenda).toLocaleDateString()}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr style={{ backgroundColor: temaAtual.fundoAlt }}>
              <th className="p-2 text-left">{t.produto}</th>
              <th className="p-2 text-left">{t.quantidade}</th>
              <th className="p-2 text-left">{t.unitario}</th>
              <th className="p-2 text-left">{t.subtotal}</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id} style={{ backgroundColor: temaAtual.fundo }}>
                <td className="p-2">{produto.nome}</td>
                <td className="p-2">{produto.quantidade}</td>
                <td className="p-2">R$ {(produto.precoUnitario ?? 0).toFixed(2)}</td>
                <td className="p-2">
                  R$ {((produto.precoUnitario ?? 0) * (produto.quantidade ?? 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-sm space-y-1">
          <p><strong>{t.subtotal}:</strong> R$ {subtotal.toFixed(2)}</p>
          <p><strong>{t.desconto} ({descontoPercentual}%):</strong> - R$ {descontoValor.toFixed(2)}</p>
          <p><strong>{t.frete}:</strong> R$ {frete.toFixed(2)}</p>
          <p><strong>{t.acrescimo}:</strong> R$ {acrescimo.toFixed(2)}</p>
          <p><strong>{t.pagamento}:</strong> {formaPagamento}</p>
          <p className="text-lg font-bold mt-2"><strong>{t.total}:</strong> R$ {totalFinal.toFixed(2)}</p>
        </div>
      </div>
    </>
  );
};

export default ModalRecibo;
