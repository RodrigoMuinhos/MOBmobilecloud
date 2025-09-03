// src/features/vendas/historico/HistoricoVendasPage.tsx
'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaSearch, FaFileImport, FaFileExport } from 'react-icons/fa';

import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { VendaAPI } from '../../../types/api/vendaApi.types';
import { ClienteAPI } from '../../../types/api/clienteApi.types';

import api from '../../../services/api';
import ResumoVendasPF from './components/ResumoVendasPf';
import ContadorPorStatus, { CorStatus, cores as CORES_STATUS } from './components/ContadorPorStatus';
import TabelaClientesPF from './components/TabelaClientesPF';
import ModalConfirmarEnvioPF from './components/ModalConfirmarEnvioPF';
import MensagemPadraoBoxPF from './components/MensagemPadraoBoxPf';
import ModalAnaliseCliente from './components/ModalAnaliseCliente';
import { normalizarClienteAPI } from '../../../utils/cliente/normalizarClienteAPI';
import { carregarBanco } from '../../../data/bancoLocal';

type FilialAPI = { id: string; nome: string; uf?: string | null; cidade?: string | null };

// União literal da cor esperada pelo ModalConfirmarEnvioPF
type CorPermitida = 'azul' | 'verde' | 'amarelo' | 'roxo' | 'cinza';

// Helpers
const cpfLimpo = (v?: string | null) => (v || '').replace(/\D/g, '');
const mapCor = (cor?: string): CorPermitida =>
  cor === 'azul' || cor === 'verde' || cor === 'amarelo' || cor === 'roxo' || cor === 'cinza' ? cor : 'cinza';

const normalizarStatusMap = (obj: Record<string, string>) => {
  const out: Record<string, string> = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    out[cpfLimpo(k)] = String(v);
  });
  return out;
};

// ✅ Type guard para garantir cliente com CPF string
const hasCpf = (c: VendaAPI['cliente']): c is NonNullable<VendaAPI['cliente']> & { cpf: string } => {
  return !!c && typeof c.cpf === 'string' && c.cpf.trim().length > 0;
};

// Compat de datas
const getDataVenda = (v: VendaAPI) =>
  (v as any).data ?? (v as any).dataVenda ?? (v as any).data_venda ?? null;

const extrairArray = (x: any) =>
  Array.isArray(x) ? x : Array.isArray(x?.data) ? x.data : Array.isArray(x?.items) ? x.items : [];

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

  // --- seleção de filial
  const [filiais, setFiliais] = useState<FilialAPI[]>([]);
  const [filialSelecionada, setFilialSelecionada] = useState<string>(''); // '' = todas

  // Carregar filiais para o select
  useEffect(() => {
    const carregarFiliais = async () => {
      try {
        const resp = await api.get<FilialAPI[]>('/filiais'); // ajuste a rota se necessário
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

  // Carregar dados dependentes da filial
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // persiste preferência
        if (filialSelecionada) localStorage.setItem('filialId', filialSelecionada);
        else localStorage.removeItem('filialId');

        const params = filialSelecionada ? { filialId: filialSelecionada } : undefined;

        const [vendasRes, statusRes, modelosRes] = await Promise.allSettled([
          api.get('/vendas', { params }),
          api.get('/clientes/status', { params }),
          api.get('/clientes/modelos-wpp'),
        ]);

        // VENDAS
        if (vendasRes.status === 'fulfilled') {
          let lista = extrairArray(vendasRes.value?.data) as VendaAPI[];

          // fallback caso o backend ainda não filtre por filial:
          if (filialSelecionada) {
            lista = lista.filter((v: any) => v?.filialId === filialSelecionada);
          }
          setVendas(lista);
        }

        // STATUS POR CPF
        if (statusRes.status === 'fulfilled') {
          setStatusMap(normalizarStatusMap(statusRes.value?.data || {}));
        } else {
          setStatusMap((prev) => prev); // mantém o último válido
        }

        // MENSAGENS POR COR (backend OU bancoLocal)
        if (modelosRes.status === 'fulfilled' && modelosRes.value?.data) {
          setMensagensPorCor(modelosRes.value.data || {});
        } else {
          const banco = carregarBanco();
          const localMsgs = banco?.clientes?.modelosFixosWppPF || {};
          setMensagensPorCor(localMsgs);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // não zere vendas nem mensagens aqui; mantém último estado válido
      }
    };

    carregarDados();
  }, [filialSelecionada]);

  // Atualiza mensagensPorCor se o usuário salvar pelo box enquanto está nesta página
  useEffect(() => {
    const onModelosSalvos = (e: any) => {
      const msgs = e?.detail || {};
      setMensagensPorCor((prev) => ({ ...prev, ...msgs }));
    };
    window.addEventListener('wpp:modelosPF:salvos', onModelosSalvos);
    return () => window.removeEventListener('wpp:modelosPF:salvos', onModelosSalvos);
  }, []);

  const totalClientes = useMemo(() => {
    const cpfs = new Set(vendas.map((v) => cpfLimpo(v.cliente?.cpf)).filter(Boolean));
    return cpfs.size;
  }, [vendas]);

  const totalVendas = vendas.length;

  const totalReceita = useMemo(() => {
    // soma robusta: totalFinal -> total -> (subtotal + frete + acrescimo - descontoValor)
    return vendas.reduce((soma, v) => {
      const tf = Number(v.totalFinal ?? NaN);
      if (Number.isFinite(tf)) return soma + tf;

      const t = Number((v as any).total ?? NaN);
      if (Number.isFinite(t)) return soma + t;

      const subtotal = Number(v.subtotal ?? 0) || 0;
      const frete = Number(v.frete ?? 0) || 0;
      const acrescimo = Number(v.acrescimo ?? 0) || 0;
      const desconto = Number(v.descontoValor ?? 0) || 0;
      return soma + subtotal + frete + acrescimo - desconto;
    }, 0);
  }, [vendas]);

  // ✅ Atualização segura do nome do cliente sem quebrar o tipo VendaAPI[]
  const atualizarNomeCliente = (novoNome: string) => {
    const doc = cpfLimpo(clienteSelecionado?.cpf);
    if (!doc) return;

    setVendas((prev) =>
      prev.map((v): VendaAPI => {
        if (hasCpf(v.cliente) && cpfLimpo(v.cliente.cpf) === doc) {
          return {
            ...v,
            cliente: {
              ...v.cliente,
              nome: novoNome,
              cpf: v.cliente.cpf, // mantém cpf como string obrigatória
            },
          };
        }
        return v; // sem alterações, permanece VendaAPI
      })
    );
  };

  const vendasDoClienteSelecionado = useMemo(() => {
    const cpfSel = cpfLimpo(clienteSelecionado?.cpf);
    return cpfSel ? vendas.filter((v) => cpfLimpo(v.cliente?.cpf) === cpfSel) : [];
  }, [vendas, clienteSelecionado]);

  // Tipo local para alimentar a tabela
  type ClienteResumoAPI = ClienteAPI & {
    totalGasto: number;
    numeroCompras: number;
    ultimaCompra: string;
  };

  const clientesAgrupados: ClienteResumoAPI[] = useMemo(() => {
    const mapa = new Map<string, ClienteResumoAPI>();

    vendas.forEach((venda) => {
      const cliente = venda.cliente;
      const cpf = cpfLimpo(cliente?.cpf);
      const nome = (cliente?.nome || '').trim();
      const tel = (cliente?.whatsapp || '').replace(/\D/g, '');

      if (!cliente || !cpf || !nome) return;

      const tf = Number(venda.totalFinal ?? 0) || 0;
      const dataVenda = getDataVenda(venda) ?? '2000-01-01';

      const existente = mapa.get(cpf);
      if (existente) {
        existente.totalGasto += tf;
        existente.numeroCompras += 1;
        if (dataVenda && new Date(dataVenda) > new Date(existente.ultimaCompra)) {
          existente.ultimaCompra = dataVenda;
        }
      } else {
        const clienteNormalizado = normalizarClienteAPI(cliente);
        mapa.set(cpf, {
          ...clienteNormalizado,
          nome,
          cpf,
          whatsapp: tel,
          totalGasto: tf,
          numeroCompras: 1,
          ultimaCompra: dataVenda,
        });
      }
    });

    return Array.from(mapa.values());
  }, [vendas]);

  const handleStatusClick = async (cpf: string | undefined, novaCor: CorPermitida) => {
    const doc = cpfLimpo(cpf);
    if (!doc) return;
    try {
      await api.put(`/clientes/status/${doc}`, { cor: novaCor });
      setStatusMap((prev) => ({ ...prev, [doc]: novaCor }));
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
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setVendas(json as VendaAPI[]);
        } else {
          alert('Formato inválido.');
        }
      } catch {
        alert('Erro ao importar JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Contador de status (por cor) para o cabeçalho
  const contadorCores = useMemo(() => {
    const base: Record<CorStatus, number> = {
      azul: 0,
      verde: 0,
      amarelo: 0,
      vermelho: 0,
      roxo: 0,
      cinza: 0,
    };
    Object.values(statusMap).forEach((raw) => {
      const cor = CORES_STATUS.includes(raw as CorStatus) ? (raw as CorStatus) : 'cinza';
      base[cor] += 1;
    });
    return base;
  }, [statusMap]);

  return (
    <div className="p-4 space-y-6" style={{ background: temaAtual.fundo, color: temaAtual.texto }}>
      {/* Cabeçalho + seletor de filial */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ResumoVendasPF totalClientes={totalClientes} totalVendas={totalVendas} totalReceita={totalReceita} />

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
      </div>

      <ContadorPorStatus contador={contadorCores} />

      {/* Filtro, exportar/importar */}
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
        <button onClick={exportarVendas} className="p-2" title={idioma.dashboard?.exportarJSON || 'Exportar JSON'}>
          <FaFileExport />
        </button>
        <button
          onClick={() => inputFileRef.current?.click()}
          className="p-2"
          title={idioma.dashboard?.importarJSON || 'Importar JSON'}
        >
          <FaFileImport />
        </button>
        <input type="file" ref={inputFileRef} accept=".json" style={{ display: 'none' }} onChange={importarVendas} />
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
          corStatus={mapCor(statusMap[modalInfo.cpf])} // ✅ sanitiza para a união literal
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
