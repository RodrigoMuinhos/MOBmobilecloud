'use client';

import React from 'react';
import { FaCheck, FaFilePdf, FaSpinner } from 'react-icons/fa';
import { Cliente } from '../../../../types/domain/cliente.types';
import { CartItem } from '../../../../types/domain/carrinho';

interface Props {
  cliente: Cliente;
  carrinho: CartItem[];
  subtotal: number;
  desconto: number;
  valorDesconto: number;
  destinoDesconto: string;
  valorFrete: number;
  acrescimo: number;
  formaPagamento: string;
  parcelas: number;
  totalFinal: number;
  onFinalizar: () => void;
  onGerarRecibo: () => void;
  temaAtual: any;
  t: any;
  isEnviandoVenda: boolean; // NOVO
}

const BotoesFinalizacao: React.FC<Props> = ({
  onFinalizar,
  onGerarRecibo,
  temaAtual,
  t,
  isEnviandoVenda,
}) => {
  return (
    <div className="flex gap-4">
      {/* Botão de Finalizar Venda */}
      <button
        onClick={onFinalizar}
        disabled={isEnviandoVenda}
        className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md transition duration-200 ${
          isEnviandoVenda ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
        }`}
        style={{
          backgroundColor: temaAtual.sucesso,
          color: temaAtual.textoBranco,
        }}
        title={t.finalizarVenda}
      >
        {isEnviandoVenda ? (
          <FaSpinner className="animate-spin" size={14} />
        ) : (
          <FaCheck size={14} />
        )}
      </button>

      {/* Botão de Gerar Recibo */}
      <button
        onClick={onGerarRecibo}
        className="w-10 h-10 flex items-center justify-center rounded-full shadow-md transition duration-200 hover:scale-105"
        style={{
          backgroundColor: temaAtual.botaoSecundario ?? temaAtual.card,
          color: temaAtual.textoBranco,
        }}
        title={t.gerarRecibo ?? 'Gerar Recibo'}
      >
        <FaFilePdf size={14} />
      </button>
    </div>
  );
};

export default BotoesFinalizacao;
