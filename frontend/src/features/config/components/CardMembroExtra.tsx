'use client';
import React, { useRef, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

type Props = {
  id: string;
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
  onUpdate: (id: string, field: 'nome' | 'avatar', value: string) => void;
  onRemove: (id: string) => void;
  onSalvar: (id: string) => void;
  salvo: boolean;
  cargo?: string;
};

const CardMembroExtra: React.FC<Props> = ({
  id,
  nome,
  avatar,
  usos,
  comissao,
  credito,
  conquista,
  onUpdate,
  onRemove,
  onSalvar,
  salvo
}) => {
  const { temaAtual } = useTheme();
  const navigate = useNavigate();
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const progresso = Math.min((usos / 50) * 100, 100);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result?.toString();
        if (url) onUpdate(id, 'avatar', url);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`p-5 rounded-xl shadow-lg border flex flex-col items-center text-center relative ${conquista?.corFundo || ''}`}
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
        borderColor: conquista?.corBorda || temaAtual.destaque,
      }}
    >
      {/* Botão de excluir */}
      <button
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
        onClick={() => onRemove(id)}
        title="Remover membro"
      >
        <FaTrash />
      </button>

      {/* Avatar com click */}
      <div
        className="relative w-24 h-24 mb-2 cursor-pointer"
        onClick={() => inputFileRef.current?.click()}
        title="Clique para trocar a foto"
      >
        <img
          src={avatar}
          className="w-24 h-24 rounded-full object-cover border-4"
          alt="Avatar"
        />
        <input
          type="file"
          accept="image/*"
          ref={inputFileRef}
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Nome editável */}
      <input
        className="text-xl font-bold text-center bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
        value={nome}
        onChange={(e) => onUpdate(id, 'nome', e.target.value)}
      />

      {/* Conquista */}
      {conquista && (
        <div className={`mt-1 flex items-center gap-1 text-sm ${conquista.corTexto}`}>
          {conquista.icon}
          <span>{conquista.nome}</span>
        </div>
      )}

      <p>Usos do cupom: {usos}</p>
      <p>Comissão: R$ {comissao.toFixed(2)}</p>

      {/* Barra de progresso */}
      <div className="w-full h-2 bg-gray-300 rounded mt-2">
        <div
          className="h-full"
          style={{
            width: `${progresso}%`,
            backgroundColor: temaAtual.destaque,
          }}
        />
      </div>

      {/* Botão Salvar */}
      {!salvo && (
        <button
          onClick={() => onSalvar(id)}
          className="mt-3 px-4 py-2 rounded w-full bg-blue-600 text-white hover:bg-blue-700"
        >
          Salvar
        </button>
      )}

      {/* Botão Usar Créditos */}
      <button
        className={`mt-3 px-4 py-2 rounded w-full ${
          credito > 0
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
        }`}
        disabled={credito <= 0}
        onClick={() => setMostrarModal(true)}
      >
        {credito > 0
          ? `Usar Créditos (R$ ${credito.toFixed(2)})`
          : 'Sem créditos disponíveis'}
      </button>

      {/* Modal de uso */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-sm text-center relative"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              borderColor: temaAtual.destaque
            }}
          >
            <h2 className="text-lg font-bold mb-2">Uso do Cupom</h2>
            <p>Valor disponível: R$ {credito.toFixed(2)}</p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  setMostrarModal(false);
                  navigate('/vendas/nova', {
                    state: {
                      credito: {
                        valor: credito,
                        origem: nome,
                        id: id,
                      }
                    }
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
              >
                Usar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardMembroExtra;
