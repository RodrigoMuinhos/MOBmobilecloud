'use client';
import React from 'react';
import { EstoqueBanco, ItemEstoque } from '../../../types/banco';
import TabelaEstoque from './TabelaEstoque';

interface Props {
  estoque: EstoqueBanco;
  temaAtual: any;
  getCorEstoque: (quantidade: number) => string;
  onEditar: (item: ItemEstoque, campo: keyof ItemEstoque, valor: string | number) => void;
  onRemover: (id: string) => void;
  onAdicionar: (categoria: string, tipo: string) => void;
  onExcluirGrupo: (categoria: string, tipo: string) => void;
}

const RenderizarTabelasEstoque: React.FC<Props> = ({
  estoque,
  temaAtual,
  getCorEstoque,
  onEditar,
  onRemover,
  onAdicionar,
  onExcluirGrupo,
}) => {
  const categorias = Object.keys(estoque);

  if (categorias.length === 0) {
    return (
      <div className="text-center text-gray-500 italic my-8">
        Nenhum dado de estoque carregado.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categorias.map((categoria) => {
        const tipos = Object.keys(estoque[categoria] || {}).filter(
          (tipo) => (estoque[categoria]?.[tipo]?.length || 0) > 0
        );

        return tipos.map((tipo) => (
          <TabelaEstoque
            key={`${categoria}-${tipo}`}
            categoria={categoria}
            tipo={tipo}
            itens={estoque[categoria][tipo]}
            temaAtual={temaAtual}
            getCorEstoque={getCorEstoque}
            onEditar={onEditar}
            onRemover={onRemover}
            onAdicionar={() => onAdicionar(categoria, tipo)}
            onExcluirGrupo={() => onExcluirGrupo(categoria, tipo)}
          />
        ));
      })}
    </div>
  );
};

export default RenderizarTabelasEstoque;
