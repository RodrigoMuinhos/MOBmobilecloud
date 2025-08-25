// src/features/estoque/components/LinhaTabelaEstoque.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import api from '../../../services/api';
import { ProdutoEstoqueAPI } from '../../../types';

const ROTAS = {
  estoques: '/estoques',
  produtoEstoque: '/produtoestoque',
};

interface Props {
  item: ProdutoEstoqueAPI;
  temaAtual: any;
  disabled: boolean;

  onSaveField?: (id: string, campo: keyof ProdutoEstoqueAPI, valor: any) => Promise<void>;
  onRemove?: (id: string) => Promise<void>;

  isDraft?: boolean;
  estoqueId?: string;      // pode vir como "id lógico" == filialId
  filialId?: string;
  filialCidade?: string;   // cidade exigida pelo backend ao criar estoque
  onCreated?: () => void;
  onCancelDraft?: () => void;
}

const LinhaTabelaEstoque: React.FC<Props> = ({
  item,
  temaAtual,
  disabled,
  onSaveField,
  onRemove,
  isDraft = false,
  estoqueId,
  filialId,
  filialCidade,
  onCreated,
  onCancelDraft,
}) => {
  /* ------------------------------ helpers ------------------------------ */
  const parseNum = (v: any, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  // "43.900,50" | "43,90" -> 43900.5 | 43.9
  const parseInput = (s: string): number => {
    if (s == null) return 0;
    const cleaned = String(s).replace(/\./g, '').replace(',', '.');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const formatInput = (n: number) =>
    Number.isFinite(n)
      ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '';

  /* ------------------------------- state ------------------------------- */
  const [form, setForm] = useState<ProdutoEstoqueAPI>(item as any);
  const [precoCaixaTexto, setPrecoCaixaTexto] = useState<string>('');

  // popula "caixas" se backend não enviar e formata preço da caixa
  useEffect(() => {
    const u = Math.max(1, parseNum((item as any).unidades_por_caixa, 1));
    const qtd = parseNum((item as any).quantidade_em_estoque, 0);
    const hasCaixas = Number.isFinite(Number((item as any).caixas));
    const caixasCalc = hasCaixas ? parseNum((item as any).caixas, 0) : Math.floor(qtd / u);

    setForm({ ...(item as any), caixas: caixasCalc } as any);
    setPrecoCaixaTexto(formatInput(parseNum((item as any).preco_venda_caixa, 0)));
  }, [item]);

  /* ------------------------------ handlers ----------------------------- */
  const handleChange =
    (campo: keyof ProdutoEstoqueAPI) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (campo === 'preco_venda_caixa') {
        const raw = e.target.value.replace(/[^\d.,]/g, '');
        setPrecoCaixaTexto(raw);
        const num = parseInput(raw);
        setForm((prev) => ({ ...(prev as any), preco_venda_caixa: num } as any));
        return;
      }

      const value =
        e.target.type === 'number'
          ? // evita NaN quando o input está vazio
            parseNum(e.target.value === '' ? 0 : e.target.value)
          : e.target.value;

      setForm((prev) => {
        const novo = { ...prev, [campo]: value as any };
        if (campo === 'caixas' || campo === 'unidades_por_caixa') {
          const caixas = parseNum(campo === 'caixas' ? value : (novo as any).caixas, 0);
          const unid = Math.max(
            1,
            parseNum(
              campo === 'unidades_por_caixa' ? value : (novo as any).unidades_por_caixa,
              1
            )
          );
          (novo as any).quantidade_em_estoque = caixas * unid;
        }
        return novo as any;
      });
    };

  // blur genérico: faz PUT apenas em linhas já persistidas
  const handleBlur =
    (campo: keyof ProdutoEstoqueAPI) => async (e: React.FocusEvent<HTMLInputElement>) => {
      if (isDraft || disabled || !item.id || !onSaveField) return;
      if (campo === 'preco_venda_caixa') return; // tem blur próprio

      const value =
        e.target.type === 'number'
          ? parseNum(e.target.value === '' ? 0 : e.target.value)
          : e.target.value;
      await onSaveField(item.id, campo, value);
    };

  // blur específico do preço da caixa (string -> número, salva e re-formata)
  const handleBlurPrecoCaixa = async () => {
    const valorNum = parseInput(precoCaixaTexto);
    const formatado = formatInput(valorNum);
    setPrecoCaixaTexto(formatado);
    setForm((prev) => ({ ...(prev as any), preco_venda_caixa: valorNum } as any));

    if (!isDraft && item.id && onSaveField) {
      await onSaveField(item.id, 'preco_venda_caixa', valorNum);
      // TabelaEstoque calcula e envia preco_venda_unidade junto
    }
  };

  // cria (se necessário) um estoque real para POST
  const ensureEstoqueId = async (): Promise<string> => {
    const idProp = (estoqueId || (form as any).estoqueId || '').trim();
    const isIdLogico = !!filialId && idProp === filialId;

    if (idProp && !isIdLogico) return idProp;

    if (!filialId) throw new Error('Selecione uma filial antes de adicionar itens.');
    const cidade = (filialCidade ?? '').trim();
    if (!cidade) throw new Error('A filial selecionada não possui "cidade" preenchida.');

    const resp = await api.post(ROTAS.estoques, {
      filialId,
      nome: `Estoque ${(form as any).marca || 'Geral'} - ${(form as any).tipo || 'Padrão'}`,
      cidade,
    });

    if (!resp.data?.id) throw new Error('Não foi possível criar o estoque.');
    return resp.data.id;
  };

  // POST (linha rascunho)
  const salvarDraft = async () => {
    if (!isDraft) return;

    try {
      const unid = Math.max(1, parseNum((form as any).unidades_por_caixa, 1));
      const effectiveEstoqueId = await ensureEstoqueId();

      const precoCaixaNum = parseInput(precoCaixaTexto);
      const caixasNum = Math.max(0, parseNum((form as any).caixas, 0));

      await api.post(ROTAS.produtoEstoque, {
        nome: (form as any).nome || 'Novo Produto',
        codigo: (form as any).codigo,
        marca: (form as any).marca,
        tipo: (form as any).tipo,
        preco_compra: parseNum((form as any).preco_compra, 0) || 0,
        preco_venda_unidade: unid > 0 ? precoCaixaNum / unid : 0,
        preco_venda_caixa: precoCaixaNum,
        // >>> Correção principal: enviar caixas no POST
        caixas: caixasNum,
        quantidade_em_estoque: caixasNum * unid,
        unidades_por_caixa: unid,
        estoqueId: effectiveEstoqueId,
        filialId,
      });

      onCreated?.();
      onCancelDraft?.();
    } catch (err: any) {
      console.error('Erro ao criar item:', err?.response?.data || err);
      alert(err?.response?.data?.erro ?? err.message ?? 'Erro ao adicionar item.');
    }
  };

  /* ---------------------------- derivados UI ---------------------------- */
  const caixas = Math.max(0, parseNum((form as any).caixas, 0));
  const unidadesPorCaixa = Math.max(1, parseNum((form as any).unidades_por_caixa, 1));
  const totalUnidades = caixas * unidadesPorCaixa;
  const precoCaixaNum = parseInput(precoCaixaTexto);
  const precoUnit = unidadesPorCaixa > 0 ? precoCaixaNum / unidadesPorCaixa : 0;

  const fmt = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      Number.isFinite(n) ? n : 0
    );

  /* ------------------------------- render ------------------------------- */
  return (
    <tr style={{ color: temaAtual.texto }}>
      {/* Código */}
      <td className="px-2 py-1">
        <input
          className="w-full bg-transparent outline-none"
          value={(form as any).codigo ?? ''}
          onChange={handleChange('codigo')}
          disabled={!isDraft}
        />
      </td>

      {/* Nome */}
      <td className="px-2 py-1">
        <input
          disabled={disabled && !isDraft}
          className="w-full bg-transparent outline-none"
          value={(form as any).nome ?? ''}
          onChange={handleChange('nome')}
          onBlur={handleBlur('nome')}
        />
      </td>

      {/* Caixas */}
      <td className="px-2 py-1">
        <input
          disabled={disabled && !isDraft}
          type="number"
          min={0}
          step={1}
          className="w-16 bg-transparent outline-none text-right"
          value={caixas}
          onChange={handleChange('caixas')}
          onBlur={handleBlur('caixas')}
        />
      </td>

      {/* Unid/Caixa */}
      <td className="px-2 py-1">
        <input
          disabled={disabled && !isDraft}
          type="number"
          min={1}
          step={1}
          className="w-16 bg-transparent outline-none text-right"
          value={unidadesPorCaixa}
          onChange={handleChange('unidades_por_caixa')}
          onBlur={handleBlur('unidades_por_caixa')}
        />
      </td>

      {/* Total */}
      <td className="px-2 py-1">{totalUnidades}</td>

      {/* Preço Caixa (com máscara pt-BR) */}
      <td className="px-2 py-1">
        <input
          disabled={disabled && !isDraft}
          type="text"
          inputMode="decimal"
          className="w-20 bg-transparent outline-none text-right"
          value={precoCaixaTexto}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d.,]/g, '');
            setPrecoCaixaTexto(raw);
            setForm((prev) => ({ ...(prev as any), preco_venda_caixa: parseInput(raw) } as any));
          }}
          onBlur={handleBlurPrecoCaixa}
        />
      </td>

      {/* Preço Unit. */}
      <td className="px-2 py-1">{fmt(precoUnit)}</td>

      {/* Ações */}
      <td className="px-2 py-1 text-center">
        {isDraft ? (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={salvarDraft}
              className="p-1 rounded"
              style={{ color: temaAtual.destaque }}
              title="Salvar"
            >
              <FaCheck size={14} />
            </button>
            <button
              onClick={onCancelDraft}
              className="p-1 rounded"
              style={{ color: '#888' }}
              title="Cancelar"
            >
              <FaTimes size={14} />
            </button>
          </div>
        ) : (
          <button
            disabled={disabled}
            onClick={() => !disabled && item.id && onRemove?.(item.id)}
            className="p-1 rounded"
            style={{
              color: disabled ? 'gray' : temaAtual.destaque,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            title="Remover item"
          >
            <FaTrash size={14} />
          </button>
        )}
      </td>
    </tr>
  );
};

export default LinhaTabelaEstoque;
