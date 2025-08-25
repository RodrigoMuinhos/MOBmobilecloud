import React, { useState, useEffect } from 'react';
import { Filial } from '../../types/filiais/filiais.types';

interface Props {
  aberta: boolean;
  onClose: () => void;
  onSubmit: (filial: Partial<Filial>) => void;
  filialEditando?: Filial | null;
}

const ModalFilialForm: React.FC<Props> = ({ aberta, onClose, onSubmit, filialEditando }) => {
  const [nome, setNome] = useState('');
  const [uf, setUf] = useState('');
  const [slug, setSlug] = useState('');
  const [corHex, setCorHex] = useState('');
  const [icone, setIcone] = useState('');
  const [ativa, setAtiva] = useState(true);

  useEffect(() => {
    if (filialEditando) {
      setNome(filialEditando.nome);
      setUf(filialEditando.uf);
      setSlug(filialEditando.slug);
      setCorHex(filialEditando.corHex ?? '');
      setIcone(filialEditando.icone ?? '');
      setAtiva(filialEditando.ativa);
    } else {
      setNome('');
      setUf('');
      setSlug('');
      setCorHex('');
      setIcone('');
      setAtiva(true);
    }
  }, [filialEditando]);

  const handleSubmit = () => {
    onSubmit({ nome, uf, slug, corHex, icone, ativa });
  };

  if (!aberta) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-[400px]">
        <h2 className="text-xl font-semibold mb-4">
          {filialEditando ? 'Editar Filial' : 'Nova Filial'}
        </h2>

        <input className="w-full mb-2" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="w-full mb-2" placeholder="UF" value={uf} onChange={(e) => setUf(e.target.value)} />
        <input className="w-full mb-2" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <input className="w-full mb-2" placeholder="Cor HEX" value={corHex} onChange={(e) => setCorHex(e.target.value)} />
        <input className="w-full mb-2" placeholder="Ícone" value={icone} onChange={(e) => setIcone(e.target.value)} />

        <label className="block mt-2">
          <input type="checkbox" checked={ativa} onChange={(e) => setAtiva(e.target.checked)} /> Ativa
        </label>

        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="text-gray-500">Cancelar</button>
          <button onClick={handleSubmit} className="text-green-600 font-semibold">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalFilialForm;
