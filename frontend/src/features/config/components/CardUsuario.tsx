import React from 'react';
import { FaTrash, FaEdit, FaUserCircle } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

interface Usuario {
  nome: string;
  email: string;
  tipo: string;
  avatar: string | null;
}

interface Props {
  usuario: Usuario;
  onEditar: () => void;
  onRemover: () => void;
}

const CardUsuario: React.FC<Props> = ({ usuario, onEditar, onRemover }) => {
  const { temaAtual } = useTheme();

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg shadow-md"
      style={{ background: temaAtual.card, color: temaAtual.texto }}
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
        {usuario.avatar ? (
          <img
            src={usuario.avatar}
            alt={usuario.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <FaUserCircle className="text-3xl text-white" />
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-lg">{usuario.nome}</h3>
        <p className="text-sm text-gray-300">{usuario.email}</p>
        <p className="text-sm capitalize">{usuario.tipo}</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onEditar} className="text-blue-500 hover:scale-110">
          <FaEdit />
        </button>
        <button onClick={onRemover} className="text-red-500 hover:scale-110">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default CardUsuario;
