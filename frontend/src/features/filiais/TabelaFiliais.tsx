import React from 'react';
import { Filial } from '../../types/filiais/filiais.types';

interface Props {
  filiais: Filial[];
  onEdit: (filial: Filial) => void;
  onDelete: (id: string) => void;
}

const TabelaFiliais: React.FC<Props> = ({ filiais, onEdit, onDelete }) => {
  return (
    <table className="min-w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2">Nome</th>
          <th className="p-2">UF</th>
          <th className="p-2">Slug</th>
          <th className="p-2">Ativa</th>
          <th className="p-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        {filiais.map((f) => (
          <tr key={f.id} className="border-t">
            <td className="p-2">{f.nome}</td>
            <td className="p-2">{f.uf}</td>
            <td className="p-2">{f.slug}</td>
            <td className="p-2">{f.ativa ? 'Sim' : 'Não'}</td>
            <td className="p-2 space-x-2">
              <button onClick={() => onEdit(f)} className="text-blue-500">Editar</button>
              <button onClick={() => onDelete(f.id)} className="text-red-500">Excluir</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TabelaFiliais;
