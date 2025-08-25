'use client';

import React, { useEffect, useState } from 'react';
import { FaDownload, FaUpload, FaTrash } from 'react-icons/fa';

import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';
import { VendaAPI } from '../../../types/api/vendaApi.types';

import api from '../../../services/api';

import BarraDeBusca from '../components/BarraDeBusca';
import CardResumoFinanceiroValores from '../components/CardResumoFinanceiroValores';
import TabelaMensal from '../components/TabelaMensal';
import ModalSelecaoRecibo from '../components/ModalSelecaoRecibo';
import ModalRecibo from '../../../components/ModalRecibo';
import GraficoResumoFinanceiro from '../components/GraficoResumoFinanceiro';

const RelatorioVendaPage: React.FC = () => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].relatorio;

  const [vendas, setVendas] = useState<VendaAPI[]>([]);
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaCpf, setBuscaCpf] = useState('');
  const [buscaUf, setBuscaUf] = useState(''); // UF
  const [vendaSelecionada, setVendaSelecionada] = useState<VendaAPI | null>(null);
  const [recibosDisponiveis, setRecibosDisponiveis] = useState<VendaAPI[] | null>(null);

  useEffect(() => {
    buscarVendas();
  }, []);

  const buscarVendas = async () => {
    try {
      const response = await api.get('/vendas');
      setVendas(response.data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  };

  const handleExportarJSON = () => {
    const blob = new Blob([JSON.stringify(vendas, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendas_exportadas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportarJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const texto = e.target?.result as string;
        const vendasImportadas: VendaAPI[] = JSON.parse(texto);

        await Promise.all(
          vendasImportadas.map((venda) => api.post('/vendas', venda))
        );

        await buscarVendas();
      } catch (error) {
        alert('Erro ao importar vendas.');
        console.error(error);
      }
    };

    reader.readAsText(file);
  };

  const handleLimparTabela = async () => {
    if (!confirm('Tem certeza que deseja apagar todas as vendas?')) return;

    try {
      await Promise.all(vendas.map((v) => api.delete(`/vendas/${v.id}`)));
      setVendas([]);
    } catch (error) {
      alert('Erro ao apagar vendas.');
    }
  };

  // --------- FILTRO COM NOME, CPF E UF ----------
  const vendasFiltradas = vendas.filter((venda) => {
    const nomeCliente = (venda.cliente?.nome || '').toLowerCase();
    const cpfCliente = (venda.cliente?.cpf || '').replace(/\D/g, '');
    const ufCliente = (venda.cliente?.estado || venda.cliente?.uf || '').toUpperCase();

    const nomeOk = !buscaNome || nomeCliente.includes(buscaNome.toLowerCase());
    const cpfOk = !buscaCpf || cpfCliente.includes(buscaCpf.replace(/\D/g, ''));
    const ufOk = !buscaUf || ufCliente === buscaUf.toUpperCase();

    return nomeOk && cpfOk && ufOk;
  });
  // ----------------------------------------------

  const handleAbrirRecibo = (venda: VendaAPI) => {
    setRecibosDisponiveis(null);
    setVendaSelecionada(venda);
  };

  const handleAbrirSelecaoRecibo = (lista: VendaAPI[]) => {
    setVendaSelecionada(null);
    setRecibosDisponiveis(lista);
  };

  return (
    <div
      className="p-4 md:p-6 min-h-screen relative"
      style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}
    >
      <input
        type="file"
        accept=".json"
        id="input-importar-json"
        onChange={handleImportarJSON}
        style={{ display: 'none' }}
      />

      <header>
        <h1 className="text-2xl font-bold mb-4" style={{ color: temaAtual.destaque }}>
          {t.titulo}
        </h1>

        <div className="absolute top-4 right-6 flex gap-3">
          <button
            onClick={handleExportarJSON}
            className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition"
            title="Exportar Vendas"
          >
            <FaDownload size={16} color="white" />
          </button>
          <button
            onClick={() => document.getElementById('input-importar-json')?.click()}
            className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition"
            title="Importar Vendas"
          >
            <FaUpload size={16} color="white" />
          </button>
          <button
            onClick={handleLimparTabela}
            className="rounded-full p-2 bg-red-600 hover:bg-red-700 transition"
            title="Limpar Tabela"
          >
            <FaTrash size={16} color="white" />
          </button>
        </div>
      </header>

      <main>
        <BarraDeBusca
          buscaNome={buscaNome}
          setBuscaNome={setBuscaNome}
          buscaCpf={buscaCpf}
          setBuscaCpf={setBuscaCpf}
          buscaUf={buscaUf}
          setBuscaUf={setBuscaUf}
        />

        <CardResumoFinanceiroValores vendas={vendasFiltradas} />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <GraficoResumoFinanceiro vendas={vendasFiltradas} />
        </div>

        <TabelaMensal
          mesReferencia="atual"
          vendas={vendasFiltradas}
          onAtualizarVendas={buscarVendas}
          onAbrirRecibo={handleAbrirRecibo}
          onAbrirSelecaoRecibo={handleAbrirSelecaoRecibo}
          setVendaParaEditar={handleAbrirRecibo}
        />
      </main>

      {recibosDisponiveis && (
        <ModalSelecaoRecibo
          lista={recibosDisponiveis}
          onSelecionar={handleAbrirRecibo}
          onCancelar={() => setRecibosDisponiveis(null)}
        />
      )}

      {vendaSelecionada && (
        <ModalRecibo
          vendaSelecionada={vendaSelecionada}
          onConfirmar={() => setVendaSelecionada(null)}
          onCancelar={() => setVendaSelecionada(null)}
        />
      )}
    </div>
  );
};

export default RelatorioVendaPage;
