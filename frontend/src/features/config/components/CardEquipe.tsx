import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

type Props = {
  nome: string;
  avatar: string;
  usos: number;
  comissao: number;
  credito: number;
  conquista: {
    nome: string;
    icon: React.ReactNode;
    corFundo?: string;
    corTexto?: string;
    corBorda?: string;
  } | null;
  onUsarCredito: () => void;
  bloqueado: boolean;
  onAbrirModal?: (nome: string, credito: number) => void; // NOVO
};

const CardEquipe: React.FC<Props> = ({
  nome,
  avatar,
  usos,
  comissao,
  credito,
  conquista,
  onUsarCredito,
  bloqueado,
  onAbrirModal, // NOVO
}) => {
  const { temaAtual } = useTheme();

  const progresso = Math.min((usos / 50) * 100, 100);

  const handleCardClick = () => {
    if (!bloqueado && onAbrirModal) {
      onAbrirModal(nome, credito);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`p-5 rounded-xl shadow-lg border flex flex-col items-center text-center cursor-pointer transition-all ${
        conquista?.corFundo || ''
      }`}
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
        borderColor: conquista?.corBorda || temaAtual.destaque,
      }}
    >
      <img src={avatar} className="w-24 h-24 rounded-full object-cover border-4 mb-2" />
      <h2 className="text-xl font-bold">{nome}</h2>

      {conquista && (
        <div className={`mt-1 flex items-center gap-1 text-sm ${conquista.corTexto}`}>
          {conquista.icon}
          <span>{conquista.nome}</span>
        </div>
      )}

      <p>Usos do cupom: {usos}</p>
      <p>Comissão: R$ {comissao.toFixed(2)}</p>

      <div className="w-full h-2 bg-gray-300 rounded mt-2">
        <div
          className="h-full"
          style={{ width: `${progresso}%`, backgroundColor: temaAtual.destaque }}
        />
      </div>

      <button
        className={`mt-3 px-4 py-2 rounded w-full ${
          credito > 0
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
        disabled={bloqueado}
        onClick={(e) => {
          e.stopPropagation(); // impede que o clique vá para o card
          onUsarCredito();
        }}
      >
        {credito > 0
          ? `Usar Créditos (R$ ${credito.toFixed(2)})`
          : 'Sem créditos disponíveis'}
      </button>
    </div>
  );
};

export default CardEquipe;