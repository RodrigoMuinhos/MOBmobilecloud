'use client';
import React from 'react';
import ReciboPDF from '../../../../features/vendas/novavenda/recibo/ReciboPDF';
import { useTheme } from '../../../../context/ThemeContext';
import { Produto } from '../../../../types/domain/carrinho'; // 

export interface ModalReciboProps {
  onClose: () => void;
  idVenda: string;
  clienteNome: string;
  clienteCPF: string;
  clienteWpp: string;
  clienteEndereco: string;
  clienteCep: string;
  clienteNascimento: string;
  dataVenda: string;
  carrinho: Produto[];
  subtotal: number;
  descontoPercentual: number;
  descontoValor: number;
  destinoDesconto: string;
  frete: number;
  acrescimo: number;
  formaPagamento: string;
  parcelas: number;
  totalFinal: number;
}

const ModalRecibo: React.FC<ModalReciboProps> = ({ onClose, idVenda, ...dadosRecibo }) => {
  const { temaAtual } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="relative w-full max-w-3xl p-6 rounded-xl shadow-2xl"
        style={{
          backgroundColor: temaAtual.card,
          color: temaAtual.texto,
          border: `4px solid ${temaAtual.destaque}`,
          maxHeight: '90vh',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl"
          aria-label="Fechar Modal"
          style={{ color: temaAtual.texto }}
        >
          ✕
        </button>

        <div className="overflow-y-auto max-h-[70vh] px-1">
          <ReciboPDF idVenda={idVenda} {...dadosRecibo} />
        </div>
      </div>
    </div>
  );
};

export default ModalRecibo;
