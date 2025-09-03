// src/pages/Dashboard.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import JSZip from 'jszip';

import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

import DashboardCharts from '../features/dashboard/components/DashboardCharts';
import CardClientes from './dashcard/CardClientes';
import CardVendas from './dashcard/CardVendas';
import CardEstoque from './dashcard/CardEstoque';
import CardReceita from './dashcard/CardReceita';
import api from '../services/api';

// ✅ use o tipo oficial da API (remove o tipo local que conflita)
import { VendaAPI } from '../types/api/vendaApi.types';

type FilialAPI = { id: string; nome: string; uf?: string | null; cidade?: string | null };

const Dashboard: React.FC = () => {
  const { temaAtual } = useTheme();
  const { currentLang, textos } = useLanguage();
  const idioma = textos[currentLang];
  const tipoUsuario = typeof window !== 'undefined' ? localStorage.getItem('tipoUsuario') : null;

  // seleção de filial ('' = todas)
  const [filiais, setFiliais] = useState<FilialAPI[]>([]);
  const [filialSelecionada, setFilialSelecionada] = useState<string>('');

  // vendas para o gráfico
  const [vendasLista, setVendasLista] = useState<VendaAPI[]>([]);
  const [carregandoVendas, setCarregandoVendas] = useState<boolean>(true);

  // ---- carregar filiais para o select
  useEffect(() => {
    const carregarFiliais = async () => {
      try {
        const resp = await api.get<FilialAPI[]>('/filiais'); // ajuste a rota se for diferente
        const lista = Array.isArray(resp.data) ? resp.data : [];
        setFiliais(lista);

        const salvo = localStorage.getItem('filialId') || '';
        if (salvo && lista.some((f) => f.id === salvo)) {
          setFilialSelecionada(salvo);
        } else {
          setFilialSelecionada('');
          localStorage.removeItem('filialId');
        }
      } catch (e) {
        console.error('Erro ao carregar filiais:', e);
      }
    };
    carregarFiliais();
  }, []);

  // ---- carregar vendas (para o gráfico), dependente da filial
  useEffect(() => {
    const carregarVendas = async () => {
      try {
        setCarregandoVendas(true);
        const params = filialSelecionada ? { filialId: filialSelecionada } : undefined;
        const resp = await api.get<VendaAPI[]>('/vendas', { params });
        setVendasLista(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        console.error('Erro ao carregar vendas:', e);
        setVendasLista([]);
      } finally {
        setCarregandoVendas(false);
      }
    };
    // persistir preferência
    if (filialSelecionada) localStorage.setItem('filialId', filialSelecionada);
    else localStorage.removeItem('filialId');

    carregarVendas();
  }, [filialSelecionada]);

  // exporta todo localStorage num zip (mantive funcionalidade antiga)
  const exportarJSON = () => {
    const zip = new JSZip();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key);
      if (value) zip.file(`${key}.json`, value);
    }
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'backup-localStorage.zip';
      link.click();
    });
  };

  const importarJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = file.name.replace('.json', '');
      const text = await file.text();
      try {
        localStorage.setItem(key, text);
      } catch (err) {
        console.error('Erro ao importar arquivo:', key, err);
      }
    }
    alert(idioma.alertas?.importacaoConcluida ?? 'Importação concluída. Recarregue a página.');
  };

  const limparLocalStorage = () => {
    const confirmado = window.confirm(
      idioma.alertas?.confirmarLimpar ?? 'Tem certeza que deseja apagar tudo?'
    );
    if (confirmado) {
      localStorage.clear();
      alert(idioma.alertas?.dadosApagados ?? 'Dados apagados. Recarregando...');
      window.location.reload();
    }
  };

  return (
    <div
      className="p-6 min-h-screen transition-all duration-300"
      style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}
    >
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold" style={{ color: temaAtual.destaque }}>
          {idioma.dashboard?.painel ?? 'Painel Geral - MOB Supply'}
        </h1>

        {/* Select de Filial (segue o tema) */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-sm opacity-80">Filial:</span>
            <select
              value={filialSelecionada}
              onChange={(e) => setFilialSelecionada(e.target.value)}
              className="rounded-md px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: temaAtual.card,
                color: temaAtual.texto,
                border: `1px solid ${temaAtual.texto || '#e5e7eb'}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <option value="">Todas as filiais</option>
              {filiais.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                  {f.uf ? ` - ${f.uf}` : ''}
                  {f.cidade ? ` / ${f.cidade}` : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2 items-center">
            <button
              onClick={exportarJSON}
              title={idioma.dashboard?.exportarJSON ?? 'Exportar JSON'}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{
                backgroundColor: temaAtual.card,
                color: temaAtual.destaque,
                border: `1px solid ${temaAtual.destaque}`,
              }}
            >
              <FaDownload />
            </button>

            <label
              title={idioma.dashboard?.importarJSON ?? 'Importar JSON'}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105"
              style={{
                backgroundColor: temaAtual.card,
                color: temaAtual.destaque,
                border: `1px solid ${temaAtual.destaque}`,
              }}
            >
              <FaUpload />
              <input type="file" multiple accept=".json" onChange={importarJSON} className="hidden" />
            </label>

            {tipoUsuario === 'adm' && (
              <button
                onClick={limparLocalStorage}
                title={idioma.dashboard?.limparDados ?? 'Limpar Histórico'}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ backgroundColor: '#b91c1c', color: '#fff' }}
              >
                <FaTrash />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Cards em modo automático: cada um consulta sua rota e respeita a filial do localStorage */}
        <CardClientes label={idioma.dashboard?.clientesAtivos ?? 'Clientes Ativos'} />
        <CardVendas label={idioma.dashboard?.vendasRealizadas ?? 'Vendas Realizadas'} />
        <CardEstoque label={idioma.dashboard?.itensEstoque ?? 'Itens em Estoque'} />
        <CardReceita label={idioma.dashboard?.receitaEstimada ?? 'Receita Estimada'} />
      </div>

      {/* Gráfico de Vendas */}
      <DashboardCharts vendas={vendasLista} carregando={carregandoVendas} />
    </div>
  );
};

export default Dashboard;
