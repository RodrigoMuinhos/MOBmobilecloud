'use client';
import React, { useState, useEffect } from 'react';
import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaPlus,
  FaTrash,
} from 'react-icons/fa';
import ModalAdicionarEstoque from './ModalAdicionarEstoque';
import ModalSelecionarLote from './ModalSelecionarLote';
import ModalVisualizarEstoque from './ModalVisualizarEstoque';
import { useTheme } from '../../../context/ThemeContext';
import { Distribuidor, Lote } from '../../../types/Distribuidor';

function formatarTelefone(numero: string): string {
  const limpo = numero.replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  } else if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  } else {
    return numero;
  }
}

export default function CardAdicionarDistribuidor() {
  const { temaAtual } = useTheme();
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [modalAberto, setModalAberto] = useState<string | null>(null);
  const [modalSelecionarLote, setModalSelecionarLote] = useState<Distribuidor | null>(null);
  const [modalEstoque, setModalEstoque] = useState<Distribuidor | null>(null);
  const [loteSelecionado, setLoteSelecionado] = useState<Lote | null>(null);

  const [novoDistribuidor, setNovoDistribuidor] = useState<Distribuidor>({
    id: '',
    nome: '',
    wpp: '',
    telefone: '',
    email: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    cpf: '',
    nascimento: '',
    studio: '',
    uf: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('VENDEDOR_ATACADO');
    if (stored) setDistribuidores(JSON.parse(stored));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoDistribuidor((prev) => ({ ...prev, [name]: value }));
  };

  const salvarDistribuidor = () => {
    const novo = { ...novoDistribuidor, id: crypto.randomUUID() };
    const atualizados = [...distribuidores, novo];
    setDistribuidores(atualizados);
    localStorage.setItem('VENDEDOR_ATACADO', JSON.stringify(atualizados));
    setNovoDistribuidor({
      id: '', nome: '', wpp: '', telefone: '', email: '', endereco: '', bairro: '',
      cidade: '', estado: '', cep: '', cpf: '', nascimento: '', studio: '', uf: ''
    });
    setFormVisible(false);
  };

  const abrirLoteModal = (dist: Distribuidor) => {
    setModalSelecionarLote(dist);
  };

  const limparEstoque = (dist: Distribuidor) => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(`VENDA_${dist.id}_`))
      .forEach((k) => localStorage.removeItem(k));
    alert('Estoques removidos.');
    setModalEstoque(null);
    setLoteSelecionado(null);
  };

  const onSelecionarLote = (lote: any, dist: Distribuidor) => {
    const dados: Lote = {
      key: lote.id,
      data: lote.dados.data,
      nome: lote.dados.nome || 'Lote',
      estoques: lote.dados.estoques,
      totalCaixas: lote.dados.totalCaixas,
      totalValor: lote.dados.totalValor,
    };

    setLoteSelecionado(dados);
    setModalEstoque(dist);
    setModalSelecionarLote(null);
  };

  return (
    <div className="space-y-6">
      {/* Botão flutuante para adicionar */}
      <button
        onClick={() => setFormVisible((v) => !v)}
        className="bg-[#556B2F] p-3 rounded-full shadow hover:scale-105 transition"
      >
        <FaPlus className="text-white" />
      </button>

      {/* Formulário */}
      {formVisible && (
        <div className="p-4 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4"
             style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}>
          <p>⚙️ Formulário de cadastro - insira os campos aqui...</p>
          {/* Campos omitidos neste exemplo */}
          <div className="col-span-full flex justify-end mt-4">
            <button
              className="bg-[#556B2F] text-white px-6 py-2 rounded hover:opacity-90"
              onClick={salvarDistribuidor}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Lista de distribuidores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {distribuidores.map((dist) => (
          <div key={dist.id}
               className="p-4 rounded-lg shadow border"
               style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}>
            <h3 className="text-xl font-bold mb-1">{dist.nome}</h3>

            {/* ✅ WhatsApp com número visível e formatado */}
           {dist.telefone || dist.wpp ? (
  <a
    href={`https://wa.me/55${(dist.telefone || dist.wpp).replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Sou da equipe MOBSupply 😊')}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-green-500 hover:underline mb-1"
  >
    <FaWhatsapp size={18} />
    <span>{formatarTelefone(dist.telefone || dist.wpp)}</span>
  </a>
) : (
  <p className="text-sm text-gray-500 italic flex items-center gap-2 mb-1">
    <FaWhatsapp size={18} />
    <span>Telefone não informado</span>
  </p>
)}
            <div className="flex items-center gap-2 text-sm mb-4">
              <FaMapMarkerAlt className="text-red-500" />
              <span>{dist.cidade}/{dist.uf}</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setModalAberto(dist.id)} className="p-2 rounded-full bg-[#556B2F] text-white">
                <FaPlus size={16} />
              </button>
              <button onClick={() => abrirLoteModal(dist)} className="p-2 rounded-full bg-[#556B2F] text-white">
                <FaBoxOpen size={16} />
              </button>
              <button onClick={() => limparEstoque(dist)} className="p-2 rounded-full bg-[#556B2F] text-white">
                <FaTrash size={16} />
              </button>
            </div>

            {/* Modal de Adição de Estoque */}
            {modalAberto === dist.id && (
              <ModalAdicionarEstoque
                distribuidorId={dist.id}
                distribuidor={dist}
                onClose={() => setModalAberto(null)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Modal para selecionar lote */}
      {modalSelecionarLote && (
        <ModalSelecionarLote
          distribuidorId={modalSelecionarLote.id}
          onSelecionar={(lote) => onSelecionarLote(lote, modalSelecionarLote)}
          onClose={() => setModalSelecionarLote(null)}
        />
      )}

      {/* Modal para visualizar estoque */}
      {modalEstoque?.nome && loteSelecionado && (
        <ModalVisualizarEstoque
          distribuidor={modalEstoque}
          lote={loteSelecionado}
          onClose={() => {
            setModalEstoque(null);
            setLoteSelecionado(null);
          }}
        />
      )}
    </div>
  );
}