'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaSearch,
  FaFileImport,
  FaFileExport,
} from 'react-icons/fa';

import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { VendaAPI } from '../../../types/api/vendaApi.types';
import { ClienteAPI } from '../../../types/api/clienteApi.types';

import api from '../../../services/api';
import ResumoVendasPF from './components/ResumoVendasPf';
import ContadorPorStatus from './components/ContadorPorStatus';
import TabelaClientesPF from './components/TabelaClientesPF';
import ModalConfirmarEnvioPF from './components/ModalConfirmarEnvioPF';
import MensagemPadraoBoxPF from './components/MensagemPadraoBoxPf';
import ModalAnaliseCliente from './components/ModalAnaliseCliente';
import { normalizarClienteAPI } from '../../../utils/cliente/normalizarClienteAPI';

const HistoricoVendasPage: React.FC = () => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const idioma = textos[currentLang];

  const [vendas, setVendas] = useState<VendaAPI[]>([]);
  const [filtro, setFiltro] = useState('');
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [mensagensPorCor, setMensagensPorCor] = useState<Record<string, string>>({});
  const [modalInfo, setModalInfo] = useState<{ cpf: string; numero: string } | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteAPI | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [vendasResp, statusResp, modelosResp] = await Promise.all([
          api.get('/vendas'),
          api.get('/clientes/status'),
          api.get('/clientes/modelos-wpp'),
        ]);

        setVendas(vendasResp.data || []);
        setStatusMap(statusResp.data || {});
        setMensagensPorCor(modelosResp.data || {});
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, []);

  const totalClientes = useMemo(() => {
    const cpfs = new Set(vendas.map(v => v.cliente?.cpf).filter(Boolean));
    return cpfs.size;
  }, [vendas]);

  const totalVendas = vendas.length;

  const totalReceita = useMemo(() => {
    return vendas.reduce((soma, venda) => soma + (venda.totalFinal ?? 0), 0);
  }, [vendas]);

  const atualizarNomeCliente = async (novoNome: string) => {
    const cpf = clienteSelecionado?.cpf;
    if (!cpf) return;

    const vendasAtualizadas = vendas.map(v =>
      v.cliente?.cpf === cpf ? { ...v, cliente: { ...v.cliente, nome: novoNome } } : v
    );

    setVendas(vendasAtualizadas);
  };

  const vendasDoClienteSelecionado = useMemo(() => {
    return clienteSelecionado
      ? vendas.filter(v => v.cliente?.cpf === clienteSelecionado.cpf)
      : [];
  }, [vendas, clienteSelecionado]);

  const clientesAgrupados = useMemo(() => {
    const mapa = new Map<
      string,
      ClienteAPI & {
        totalGasto: number;
        numeroCompras: number;
        ultimaCompra: string;
      }
    >();

    vendas.forEach(venda => {
      const cliente = venda.cliente;
      const cpf = cliente?.cpf?.replace(/\D/g, '') ?? '';
      const nome = cliente?.nome?.trim() ?? '';
      const tel = cliente?.whatsapp?.replace(/\D/g, '') ?? '';

      if (!cliente || !cpf || !nome) return;

      const existente = mapa.get(cpf);
      if (existente) {
        existente.totalGasto += venda.totalFinal ?? 0;
        existente.numeroCompras += 1;
        if (venda.data && new Date(venda.data) > new Date(existente.ultimaCompra)) {
          existente.ultimaCompra = venda.data;
        }
      } else {
        const clienteNormalizado = normalizarClienteAPI(cliente);

        mapa.set(cpf, {
          ...clienteNormalizado,
          nome,
          cpf,
          whatsapp: tel,
          totalGasto: venda.totalFinal ?? 0,
          numeroCompras: 1,
          ultimaCompra: venda.data ?? '2000-01-01',
        });
      }
    });

    return Array.from(mapa.values());
  }, [vendas]);

  const handleStatusClick = async (cpf: string | undefined, novaCor: string) => {
    if (!cpf) return;
    try {
      await api.put(`/clientes/status/${cpf}`, { cor: novaCor });
      setStatusMap(prev => ({ ...prev, [cpf]: novaCor }));
    } catch (error) {
      console.error('Erro ao atualizar status do cliente:', error);
    }
  };

  const exportarVendas = () => {
    const blob = new Blob([JSON.stringify(vendas, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vendas.json';
    link.click();
  };

  const importarVendas = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setVendas(json);
        } else {
          alert('Formato inválido.');
        }
      } catch {
        alert('Erro ao importar JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-6" style={{ background: temaAtual.fundo, color: temaAtual.texto }}>
      <ResumoVendasPF
        totalClientes={totalClientes}
        totalVendas={totalVendas}
        totalReceita={totalReceita}
      />

      <ContadorPorStatus contador={statusMap} />

      <div className="flex items-center gap-2 mb-4">
        <FaSearch />
        <input
          type="text"
          placeholder={idioma.geral?.buscar || 'Buscar...'}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="flex-1 p-2 rounded border"
          style={{ background: temaAtual.input, color: temaAtual.texto }}
        />
        <button onClick={exportarVendas} className="p-2">
          <FaFileExport />
        </button>
        <button onClick={() => inputFileRef.current?.click()} className="p-2">
          <FaFileImport />
        </button>
        <input
          type="file"
          ref={inputFileRef}
          accept=".json"
          style={{ display: 'none' }}
          onChange={importarVendas}
        />
      </div>

      <TabelaClientesPF
        clientes={clientesAgrupados}
        statusMap={statusMap}
        mensagensPorCor={mensagensPorCor}
        filtro={filtro}
        vendas={vendas}
        onStatusClick={handleStatusClick}
        onAbrirModal={setModalInfo}
        onAbrirAnalise={setClienteSelecionado}
      />

      <MensagemPadraoBoxPF />

      {modalInfo && (
        <ModalConfirmarEnvioPF
          numero={modalInfo.numero}
          corStatus={statusMap[modalInfo.cpf] || 'cinza'}
          onFechar={() => setModalInfo(null)}
        />
      )}

      {clienteSelecionado && (
        <ModalAnaliseCliente
          cliente={clienteSelecionado}
          vendasDoCliente={vendasDoClienteSelecionado}
          onFechar={() => setClienteSelecionado(null)}
          onAtualizarNome={atualizarNomeCliente}
        />
      )}
    </div>
  );
};

export default HistoricoVendasPage;
