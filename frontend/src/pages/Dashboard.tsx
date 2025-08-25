'use client';
import React, { useEffect, useState } from 'react';
import { FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import JSZip from 'jszip';

import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { carregarBanco } from '../data/bancoLocal';
import { BancoMobSupply, Cliente, Venda, ItemEstoque } from '../types/banco';

import DashboardCharts from '../features/dashboard/components/DashboardCharts';
import CardClientes from './dashcard/CardClientes';
import CardVendas from './dashcard/CardVendas';
import CardEstoque from './dashcard/CardEstoque';
import CardReceita from './dashcard/CardReceita';

const Dashboard: React.FC = () => {
  const { temaAtual } = useTheme();
  const { currentLang, textos } = useLanguage();
  const idioma = textos[currentLang];
  const tipoUsuario = localStorage.getItem('tipoUsuario');

  const [clientes, setClientes] = useState(0);
  const [clientesTotais, setClientesTotais] = useState(0);
  const [vendas, setVendas] = useState(0);
  const [caixasTotais, setCaixasTotais] = useState(0);
  const [unidadesTotais, setUnidadesTotais] = useState(0);
  const [receita, setReceita] = useState(0);
  const [vendasLista, setVendasLista] = useState<Venda[]>([]);

  useEffect(() => {
    const banco: BancoMobSupply = carregarBanco();

    // ✅ CLIENTES
    const clientesArray: Cliente[] = Array.isArray(banco.clientes?.pf) ? banco.clientes.pf : [];
    const clientesValidos = clientesArray.filter(
      (cliente) => !cliente.incompleto && cliente.nome && cliente.nascimento
    );
    setClientes(clientesValidos.length);
    setClientesTotais(clientesArray.length);

    // ✅ VENDAS
    const vendasArray: Venda[] = Array.isArray(banco.vendas)
      ? banco.vendas
      : typeof banco.vendas === 'object'
        ? Object.values(banco.vendas)
        : [];
    setVendas(vendasArray.length);
    setVendasLista(vendasArray);

    const totalReceita = vendasArray.reduce((acc, v) => acc + (v.total ?? 0), 0);
    setReceita(totalReceita);

    // ✅ ESTOQUE
    const estoqueBanco = banco.estoque || {};
    let caixas = 0;
    let unidades = 0;

    Object.values(estoqueBanco).forEach((tipos) => {
      if (typeof tipos === 'object') {
        Object.values(tipos).forEach((lista) => {
          if (Array.isArray(lista)) {
            lista.forEach((produto: ItemEstoque) => {
              caixas += produto.caixas || 0;
              unidades += (produto.caixas || 0) * (produto.unidades_por_caixa || 0);
            });
          }
        });
      }
    });

    setCaixasTotais(caixas);
    setUnidadesTotais(unidades);
  }, []);

  const exportarJSON = () => {
    const zip = new JSZip();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          zip.file(`${key}.json`, value);
        }
      }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: temaAtual.destaque }}>
          {idioma.dashboard?.painel ?? 'Painel Geral - MOB Supply'}
        </h1>

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

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <CardClientes clientes={clientes} total={clientesTotais} label={idioma.dashboard?.clientesAtivos ?? 'Clientes Ativos'} />
        <CardVendas vendas={vendas} label={idioma.dashboard?.vendasRealizadas ?? 'Vendas Realizadas'} />
        <CardEstoque label={idioma.dashboard?.itensEstoque ?? 'Itens em Estoque'} />
        <CardReceita receita={receita} label={idioma.dashboard?.receitaEstimada ?? 'Receita Estimada'} />
      </div>

      {/* Gráfico de Vendas */}
     <DashboardCharts vendas={vendasLista} />
    </div>
  );
};

export default Dashboard;
