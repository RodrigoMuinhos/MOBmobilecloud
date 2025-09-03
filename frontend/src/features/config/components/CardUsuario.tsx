// src/features/config/components/CardUsuario.tsx
import React, { useMemo } from 'react';
import { FaTrash, FaEdit, FaUserCircle } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { PLACEHOLDER, resolveAvatar } from '../../../utils/avatar';

type TipoUsuario = 'adm' | 'filiado' | 'vendedor';

interface Usuario {
  nome: string;
  email?: string;
  tipo: TipoUsuario | string;
  avatar: string | null;
}

interface Props {
  usuario: Usuario;
  onEditar: () => void;
  onRemover: () => void;
}

const CardUsuario: React.FC<Props> = ({ usuario, onEditar, onRemover }) => {
  const { temaAtual } = useTheme();

  // monta URL absoluta correta (http://localhost:3333/uploads/...)
  const avatarSrc = useMemo(() => resolveAvatar(usuario.avatar), [usuario.avatar]);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg shadow-md"
      style={{ background: temaAtual.card, color: temaAtual.texto }}
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center shrink-0">
        {usuario.avatar ? (
          <img
            key={avatarSrc}  // força re-render quando a url mudar
            src={avatarSrc}
            alt={`Avatar de ${usuario.nome}`}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable={false}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.onerror = null;         // evita loop
              img.src = PLACEHOLDER;      // fallback estável
            }}
          />
        ) : (
          <FaUserCircle className="text-3xl text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg truncate">{usuario.nome}</h3>
        {usuario.email && (
          <p className="text-sm opacity-70 truncate">{usuario.email}</p>
        )}
        <p className="text-sm capitalize">{String(usuario.tipo)}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onEditar}
          className="text-blue-500 hover:scale-110 transition"
          title="Editar usuário"
          aria-label={`Editar ${usuario.nome}`}
        >
          <FaEdit />
        </button>
        <button
          onClick={onRemover}
          className="text-red-500 hover:scale-110 transition"
          title="Remover usuário"
          aria-label={`Remover ${usuario.nome}`}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default CardUsuario;
