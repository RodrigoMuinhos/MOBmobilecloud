'use client';
import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { Lote } from '../../../types/Distribuidor';

type Props = {
  distribuidorId: string;
  onSelecionar: (lote: { id: string; dados: Lote }) => void;
  onClose: () => void;
};

export default function ModalSelecionarLote({ distribuidorId, onSelecionar, onClose }: Props) {
  const { temaAtual } = useTheme();
  const [lotes, setLotes] = useState<{ id: string; dados: Lote }[]>([]);

  useEffect(() => {
    const encontrados = Object.entries(localStorage)
      .filter(([key]) => key.startsWith(`VENDA_${distribuidorId}_`))
      .map(([key, value]) => {
        try {
          const dados: Lote = JSON.parse(value);
          return { id: key, dados };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as { id: string; dados: Lote }[];

    setLotes(encontrados);
  }, [distribuidorId]);

  const removerLote = (id: string) => {
    if (confirm('Deseja remover este lote?')) {
      localStorage.removeItem(id);
      setLotes((prev) => prev.filter((lote) => lote.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="w-full max-w-md p-6 rounded-lg shadow-lg"
        style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Selecione um Lote</h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-white"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Conteúdo */}
        <div className="space-y-4">
          {lotes.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum lote encontrado.</p>
          ) : (
            lotes.map(({ id, dados }) => {
              const { nome, data, totalCaixas, totalValor } = dados;

              return (
                <div
                  key={id}
                  className="p-4 rounded border flex justify-between items-start gap-3 cursor-pointer hover:border-green-400 transition"
                  style={{ backgroundColor: temaAtual.fundo }}
                >
                  {/* Info */}
                  <div onClick={() => onSelecionar({ id, dados })} className="flex-1 space-y-1">
                    <p className="font-semibold">{nome || 'Lote'}</p>
                    <p className="text-sm">📅 Data: {data || '--'}</p>
                    <p className="text-sm">📦 Total: {totalCaixas ?? '--'} caixas</p>
                    <p className="text-sm">💰 Valor: R$ {totalValor?.toFixed(2) ?? '--'}</p>
                  </div>

                  {/* Botão de remover */}
                  <button
                    onClick={() => removerLote(id)}
                    className="text-red-500 hover:text-red-700 mt-1"
                    title="Remover Lote"
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}