import React, { useEffect, useState } from 'react';
import TabelaFiliais from './TabelaFiliais';
import ModalFilialForm from './ModalFilialForm';
import { Filial } from '../../types/filiais/filiais.types';
import api from '../../services/api';

const FiliaisPage: React.FC = () => {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Filial | null>(null);

  const carregar = async () => {
    const res = await api.get('/filiais');
    setFiliais(res.data);
  };

  const salvar = async (dados: Partial<Filial>) => {
    if (editando) {
      await api.put(`/filiais/${editando.id}`, dados);
    } else {
      await api.post('/filiais', dados);
    }
    setModalAberto(false);
    setEditando(null);
    carregar();
  };

  const excluir = async (id: string) => {
    if (confirm('Deseja excluir esta filial?')) {
      await api.delete(`/filiais/${id}`);
      carregar();
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Filiais</h1>
        <button onClick={() => { setEditando(null); setModalAberto(true); }} className="bg-blue-600 text-white px-4 py-2 rounded">
          Nova Filial
        </button>
      </div>

      <TabelaFiliais filiais={filiais} onEdit={(f) => { setEditando(f); setModalAberto(true); }} onDelete={excluir} />

      <ModalFilialForm aberta={modalAberto} onClose={() => setModalAberto(false)} onSubmit={salvar} filialEditando={editando} />
    </div>
  );
};

export default FiliaisPage;
