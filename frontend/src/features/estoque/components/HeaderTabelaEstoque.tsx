'use client';
import React from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';

type Props = {
  titulo: string;
  temaAtual: any;
  onAdicionar: () => void;
  onExcluirGrupo: () => void;
  addDisabled?: boolean;
  addTitle?: string;
  deleteTitle?: string;
};

const HeaderTabelaEstoque: React.FC<Props> = ({
  titulo,
  temaAtual,
  onAdicionar,
  onExcluirGrupo,
  addDisabled = false,
  addTitle = 'Adicionar novo item',
  deleteTitle = 'Excluir grupo inteiro',
}) => {
  return (
    <div
      className="sticky top-0 z-10 px-4 py-2 font-bold flex items-center justify-between"
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.titulo,
        borderBottom: `1px solid ${temaAtual.destaque}`,
      }}
      role="toolbar"
      aria-label={`Ações do grupo ${titulo}`}
    >
      <span>{titulo}</span>

      <div className="flex gap-2">
        <button
          onClick={onExcluirGrupo}
          className="p-1 rounded"
          style={{ backgroundColor: temaAtual.fundoAlt, color: temaAtual.destaque }}
          title={deleteTitle}
          aria-label={deleteTitle}
        >
          <FaTrash size={14} />
        </button>

        <button
          onClick={onAdicionar}
          disabled={addDisabled}
          className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: temaAtual.texto, color: temaAtual.fundo }}
          title={addTitle}
          aria-label={addTitle}
        >
          <FaPlus size={14} />
        </button>
      </div>
    </div>
  );
};

export default HeaderTabelaEstoque;
