// src/features/estoque/pages/EstoqueAtualPage.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

// ⚠️ Use apenas os tipos da API aqui
import type { ProdutoEstoqueAPI as ProdutoEstoqueAPIResp } from '../../../types/api/produtoEstoqueApi.types';
import { organizarEstoquePorGrupo } from '../../../utils/estoqueUtils';
import type { EstoqueBanco } from '../../../utils/estoqueUtils';

import BotaoEstoqueActions from '../components/BotaoEstoqueActions';
import ModalNovaCategoria from '../components/ModalNovaCategoria';
import TotaisGeraisEstoque from '../components/TotaisGeraisEstoque';
import TabelaEstoque from '../components/TabelaEstoque';

import AbasFiliais, { FilialAPI } from '../components/AbasFiliais';
import ModalCriarFilial from '../components/ModalCriarFilial';
import { FaBuilding } from 'react-icons/fa';

// ✅ import do gerador de PDF
import { exportarEstoquePdf } from '../../../utils/exportarEstoquePdf';

type CategoriaAPI = { id: string; categoria: string; tipo: string; filialId?: string | null };

// Alias local: garante id e permite estoqueId/filialId
type ProdutoEstoque = Omit<ProdutoEstoqueAPIResp, 'id'> & {
  id: string;
  estoqueId?: string | null;
  filialId?: string | null;
};

// 👇 Mapeamento para preencher cidade automaticamente pelo UF
const CIDADE_PADRAO_POR_UF: Record<string, string> = {
  PE: 'Recife',
  CE: 'Fortaleza',
  PA: 'Belém',
};

const EstoqueAtualPage: React.FC = () => {
  const { temaAtual } = useTheme();
  const { currentLang, textos } = useLanguage();
  const t = textos[currentLang].estoque;

  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [filiais, setFiliais] = useState<FilialAPI[]>([]);
  const [filialId, setFilialId] = useState<string>('');
  const [estoqueIdAtivo, setEstoqueIdAtivo] = useState<string>(''); // estoque == filial
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [abrirModalFilial, setAbrirModalFilial] = useState(false);

  const filialAtiva = useMemo(
    () => filiais.find((f) => f.id === filialId) || null,
    [filiais, filialId]
  );

  // 👇 Deriva UF/cidade e aplica fallback automático por UF
  const uf = String((filialAtiva as any)?.uf ?? (filialAtiva as any)?.estado ?? '')
    .toUpperCase()
    .trim();
  const cidadeFromApi = String((filialAtiva as any)?.cidade ?? '').trim();
  const filialCidade = cidadeFromApi || CIDADE_PADRAO_POR_UF[uf] || '';

  const labelFilial = useMemo(() => {
    if (!filialAtiva) return '';
    const titulo =
      (filialAtiva as any).nome ||
      [filialCidade, uf].filter(Boolean).join('-') ||
      filialCidade ||
      'Filial';
    const sufixo = uf ? ` (${uf})` : '';
    return `${titulo}${sufixo}`;
  }, [filialAtiva, filialCidade, uf]);

  const carregarFiliais = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<FilialAPI[]>('/filiais');
      setFiliais(data);
      const saved = localStorage.getItem('ultimaFilialId') || '';
      const chosen = saved || data[0]?.id || '';
      if (chosen) setFilialId(chosen);
    } finally {
      setLoading(false);
    }
  };

  // Busca produtos e categorias da filial
  const carregarProdutosECategorias = async (filial: string) => {
    const [prodRes, catRes] = await Promise.all([
      api.get<ProdutoEstoqueAPIResp[]>('/produtoestoque', { params: { filialId: filial } }),
      api.get<CategoriaAPI[]>('/categoriaestoque', { params: { filialId: filial } }),
    ]);

    // 🔧 Normaliza produtos e DERIVA "caixas" quando o backend não envia
    const prods: ProdutoEstoque[] = (prodRes.data || []).map((p, i) => {
      const u = Math.max(1, Number((p as any).unidades_por_caixa ?? 1));
      const qtd = Number((p as any).quantidade_em_estoque ?? 0);
      const temCaixas = Number.isFinite(Number((p as any).caixas));
      const caixasDerivadas = temCaixas ? Number((p as any).caixas) : Math.floor(qtd / u);

      return {
        ...p,
        id: p.id ?? `tmp-${Date.now()}-${i}`,
        estoqueId: filial,
        filialId: filial,
        caixas: caixasDerivadas, // ✅ garante valor visível e persistente no front
      } as ProdutoEstoque;
    });

    const categorias = catRes.data || [];

    // Placeholders para categorias sem produtos
    const placeholders: ProdutoEstoque[] = categorias
      .filter((cat) => !prods.some((p) => p.marca === cat.categoria && p.tipo === cat.tipo))
      .map((cat) => ({
        id: `vazio-${cat.id}`,
        nome: '',
        codigo: '',
        marca: cat.categoria,
        tipo: cat.tipo,
        preco_compra: 0,
        preco_venda_unidade: 0,
        preco_venda_caixa: 0,
        quantidade_em_estoque: 0,
        unidades_por_caixa: 1,
        filialId: filial,
        estoqueId: filial,
        caixas: 0,
      }));

    setProdutos([...prods, ...placeholders]);
  };

  // Fluxo ao trocar/definir filial
  const carregarTudoDaFilial = async (filial: string) => {
    if (!filial) return;
    try {
      setEstoqueIdAtivo(filial); // estoque == filial
      localStorage.setItem(`ultimoEstoqueId::${filial}`, filial);
      await carregarProdutosECategorias(filial);
      localStorage.setItem('ultimaFilialId', filial);
    } catch (error) {
      console.error('Erro ao carregar dados da filial:', error);
      alert(t.erroCarregar || 'Erro ao carregar estoque.');
    }
  };

  // Cria categoria
  const adicionarCategoria = async (categoriaInput: string, tipoInput: string) => {
    const norm = (s: string) => s.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();

    const categoria = norm(categoriaInput ?? '');
    const tipo = norm(tipoInput ?? '');

    if (!filialId) {
      alert('Selecione/crie uma filial antes de adicionar categoria.');
      return;
    }
    if (!categoria || !tipo) {
      alert('Preencha categoria e tipo.');
      return;
    }

    const jaExiste = produtos.some(
      (p) => norm(p.marca ?? '') === categoria && norm(p.tipo ?? '') === tipo
    );

    if (jaExiste) {
      setMostrarModal(false);
      await carregarProdutosECategorias(filialId);
      return;
    }

    const payload = { categoria: categoriaInput.trim(), tipo: tipoInput.trim(), filialId };
    try {
      await api.post('/categoriaestoque', payload, {
        validateStatus: (s) => (s >= 200 && s < 300) || s === 409,
      });
      setMostrarModal(false);
      await carregarProdutosECategorias(filialId);
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      console.error('Erro ao criar categoria:', error?.response?.data || error);
      alert(msg || (t.erroCriarCategoria || 'Erro ao criar categoria.'));
    }
  };

  const onFilialCriada = async (nova: FilialAPI) => {
    try {
      await carregarFiliais();
      setFilialId(nova.id);
      await carregarTudoDaFilial(nova.id);
    } catch {
      setFiliais((prev) => [...prev, nova]);
      setFilialId(nova.id);
      await carregarTudoDaFilial(nova.id);
    }
  };

  useEffect(() => {
    carregarFiliais();
  }, []);

  useEffect(() => {
    carregarTudoDaFilial(filialId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filialId]);

  const estoqueAgrupado: EstoqueBanco = useMemo(
    () => organizarEstoquePorGrupo(produtos),
    [produtos]
  );

  // ✅ Exportar PDF (usa somente itens reais; ignora placeholders "vazio-...")
const handleExportarPDF = () => {
  const itensVisiveis = [...produtos]
    .filter((p) => !String(p.id).startsWith('vazio-'))
    .sort((a, b) => (a.marca ?? '').localeCompare(b.marca ?? '') || (a.tipo ?? '').localeCompare(b.tipo ?? '') || (a.nome ?? '').localeCompare(b.nome ?? ''));

  if (itensVisiveis.length === 0) {
    alert('Nada para exportar.');
    return;
  }

  // Detecta viewport: se for estreita, gera PDF em modo mobile (A5 retrato)
  const modo: 'mobile' | 'desktop' = typeof window !== 'undefined' && window.innerWidth <= 768 ? 'mobile' : 'desktop';

exportarEstoquePdf(itensVisiveis as any, {
  filialNome: labelFilial || undefined,
  cidade: filialCidade || undefined,
  temaHeaderHex: temaAtual.destaque, // header na cor do tema
  // layout: 'resumo' // opcional, se quiser o resumo por grupo
});
};


  // Sem filiais
  if (!loading && filiais.length === 0) {
    return (
      <div className="p-6" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: temaAtual.texto }}>Estoque</h1>
        <p className="mb-4" style={{ color: temaAtual.texto }}>
          Nenhum local de estoque encontrado. Crie uma filial antes de continuar.
        </p>

        <button
          onClick={() => setAbrirModalFilial(true)}
          className="px-4 py-2 rounded text-white hover:opacity-95"
          style={{ backgroundColor: temaAtual.texto ?? '#2e7d32' }}
        >
          Novo Estoque
        </button>

        <ModalCriarFilial
          open={abrirModalFilial}
          onClose={() => setAbrirModalFilial(false)}
          onCreated={onFilialCriada}
          tema={temaAtual}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
      {/* Botão nova filial */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setAbrirModalFilial(true)}
          className="rounded-full p-2 hover:opacity-80"
          style={{ backgroundColor: temaAtual.texto ?? temaAtual.destaque, color: '#fff' }}
          title="Novo Estoque"
        >
          <FaBuilding size={18} />
        </button>
      </div>

      {/* Abas por filial */}
      <AbasFiliais filiais={filiais} filialIdAtiva={filialId} onTrocarFilial={setFilialId} />

      {/* Título + ações */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: temaAtual.texto }}>Estoque</h1>
          <div className="text-sm opacity-70" style={{ color: temaAtual.texto }}>
            {filialAtiva ? `Filial: ${labelFilial}` : 'Selecione uma filial'}
          </div>
        </div>

        <BotaoEstoqueActions
          onAdicionarProduto={() => setMostrarModal(true)}
          onAtualizar={() => carregarTudoDaFilial(filialId)}
          onLimpar={async () => {
            if (confirm(t.limparPergunta || 'Deseja realmente limpar o estoque?')) {
              await api.delete('/produtoestoque', { params: { filialId } });
              await carregarTudoDaFilial(filialId);
            }
          }}
          onExportarPDF={handleExportarPDF} // 👈 agora exporta de verdade
        />
      </div>

      {/* Tabelas por categoria/tipo */}
      {Object.entries(estoqueAgrupado).map(([categoria, tipos]) =>
        Object.entries(tipos).map(([tipo, itens]) => {
          const estoqueIdDoGrupo = filialId; // estoque == filial
          return (
            <TabelaEstoque
              key={`${categoria}-${tipo}`}
              categoria={categoria}
              tipo={tipo}
              itens={itens}
              temaAtual={temaAtual}
              carregarEstoque={() => carregarTudoDaFilial(filialId)}
              filialId={filialId}
              estoqueId={estoqueIdDoGrupo}
              filialCidade={filialCidade}   // cidade resolvida (API ou fallback por UF)
            />
          );
        })
      )}

      {/* Totais */}
      <TotaisGeraisEstoque estoque={estoqueAgrupado} />

      {mostrarModal && (
        <ModalNovaCategoria
          onConfirmar={adicionarCategoria}
          onFechar={() => setMostrarModal(false)}
        />
      )}

      {/* Modal criar filial */}
      <ModalCriarFilial
        open={abrirModalFilial}
        onClose={() => setAbrirModalFilial(false)}
        onCreated={onFilialCriada}
        tema={temaAtual}
      />
    </div>
  );
};

export default EstoqueAtualPage;
