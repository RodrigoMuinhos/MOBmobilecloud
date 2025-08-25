import React, { useEffect, useState } from 'react';
import { FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

type Props = {
  onFechar: () => void;
  onSelecionar: (mensagem: string) => void;
};

const ModalGerenciarModelos: React.FC<Props> = ({ onFechar, onSelecionar }) => {
  const { temaAtual } = useTheme();
  const [modelos, setModelos] = useState<string[]>([]);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [novoTexto, setNovoTexto] = useState('');

  useEffect(() => {
    const salvos = localStorage.getItem('modelosWpp');
    if (salvos) {
      setModelos(JSON.parse(salvos));
    }
  }, []);

  const salvarNoStorage = (lista: string[]) => {
    setModelos(lista);
    localStorage.setItem('modelosWpp', JSON.stringify(lista));
  };

  const handleSalvarEdicao = (index: number) => {
    const atualizados = [...modelos];
    atualizados[index] = novoTexto;
    salvarNoStorage(atualizados);
    setEditandoIndex(null);
    setNovoTexto('');
  };

  const handleExcluir = (index: number) => {
    if (confirm('Deseja excluir este modelo?')) {
      const atualizados = modelos.filter((_, i) => i !== index);
      salvarNoStorage(atualizados);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="w-full max-w-xl rounded-lg shadow-lg p-6 relative"
        style={{
          background: temaAtual.cardGradient || temaAtual.card,
          color: temaAtual.texto,
          border: `1px solid ${temaAtual.destaque}`,
        }}
      >
        {/* Botão fechar */}
        <button
          onClick={onFechar}
          className="absolute top-3 right-3 text-xl"
          style={{ color: temaAtual.texto }}
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-bold mb-4">Modelos de Mensagem</h2>

        {modelos.length === 0 && (
          <p className="text-sm text-gray-400">Nenhum modelo salvo ainda.</p>
        )}

        <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {modelos.map((modelo, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-2 rounded-md"
              style={{
                backgroundColor: temaAtual.fundoAlt,
                border: `1px solid ${temaAtual.destaque}`,
              }}
            >
              {editandoIndex === index ? (
                <>
                  <input
                    value={novoTexto}
                    onChange={(e) => setNovoTexto(e.target.value)}
                    className="flex-1 border px-2 py-1 text-sm rounded mr-2"
                    style={{
                      borderColor: temaAtual.destaque,
                      background: temaAtual.fundo,
                      color: temaAtual.texto,
                    }}
                  />
                  <button
                    onClick={() => handleSalvarEdicao(index)}
                    className="text-green-600 font-bold text-sm"
                  >
                    Salvar
                  </button>
                </>
              ) : (
                <>
                  <span
                    onClick={() => onSelecionar(modelo)}
                    title="Usar este modelo"
                    className="cursor-pointer text-sm flex-1 hover:underline"
                  >
                    {modelo}
                  </span>
                  <div className="flex gap-3 items-center ml-2">
                    <button
                      onClick={() => {
                        setEditandoIndex(index);
                        setNovoTexto(modelo);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleExcluir(index)}
                      className="text-red-500 hover:text-red-700"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ModalGerenciarModelos;
