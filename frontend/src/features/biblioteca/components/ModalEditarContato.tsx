import React from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

interface Props {
  valor: string;
  onFechar: () => void;
  onSalvar: (novo: string) => void;
}

const ModalEditarContato: React.FC<Props> = ({ valor, onFechar, onSalvar }) => {
  const { temaAtual } = useTheme();
  const [input, setInput] = React.useState(valor);

  const aoSalvar = () => {
    if (!input.trim()) return;
    onSalvar(input.trim());
    onFechar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="rounded-lg shadow-lg w-[90%] max-w-md p-6"
        style={{
          background: temaAtual.cardGradient || temaAtual.card,
          color: temaAtual.texto,
          border: `1px solid ${temaAtual.destaque}`,
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Contato</h3>
          <button
            onClick={onFechar}
            className="text-lg"
            style={{ color: temaAtual.texto }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Campo de edição */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && aoSalvar()}
          className="w-full p-2 text-sm rounded border mb-4"
          style={{
            backgroundColor: temaAtual.fundoAlt,
            color: temaAtual.texto,
            border: `1px solid ${temaAtual.destaque}`,
          }}
        />

        {/* Botão de salvar */}
        <button
          onClick={aoSalvar}
          className="w-full py-2 rounded flex items-center justify-center transition"
          style={{
            backgroundColor: temaAtual.destaque,
            color: temaAtual.textoClaro,
          }}
        >
          <FaSave className="mr-2" /> Salvar Contato
        </button>
      </div>
    </div>
  );
};

export default ModalEditarContato;
