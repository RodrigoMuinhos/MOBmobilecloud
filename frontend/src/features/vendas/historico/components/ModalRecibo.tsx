'use client';
import React, { useMemo } from 'react';
import ReciboPDF from '../../../../features/vendas/novavenda/recibo/ReciboPDF';
import { useTheme } from '../../../../context/ThemeContext';
import { Produto } from '../../../../types/domain/carrinho'; // mantém o destino final do ReciboPDF

export interface ModalReciboProps {
  onClose: () => void;
  idVenda: string;

  // Dados do cliente
  clienteNome: string;
  clienteCPF: string;
  clienteWpp: string;
  clienteEndereco: string;
  clienteCep: string;
  clienteNascimento: string;

  // Dados da venda
  dataVenda: string;

  /**
   * Aceita itens em QUALQUER um dos formatos a seguir:
   * - Produto (domínio antigo)
   * - ItemCarrinho da API (com campos como nome/produtoNome, quantidade/qtd, preco/precoUnitario etc.)
   * - CartItem (se existir no seu projeto)
   */
  carrinho: Array<Produto | any>;

  subtotal: number;
  descontoPercentual: number;
  descontoValor: number;
  destinoDesconto: string;
  frete: number;
  acrescimo: number;
  formaPagamento: string;
  parcelas: number;
  totalFinal: number;
}

// helpers
const gerarId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `tmp_${Math.random().toString(36).slice(2, 10)}`;

const toNumber = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Converte um item "qualquer" (API/CartItem/antigo) em Produto (domínio),
 * preenchendo os campos mínimos que o ReciboPDF utiliza.
 */
function normalizarItemParaProduto(item: any): Produto {
  const id =
    item?.id ??
    item?.produtoId ??
    item?.idProduto ??
    item?.codigo ??
    gerarId();

  const nome =
    item?.nome ??
    item?.produtoNome ??
    item?.descricao ??
    'Produto';

  const quantidade = toNumber(item?.quantidade ?? item?.qtd ?? item?.qte ?? 0);

  // preço unitário pode vir com nomes diferentes
  const precoUnitario = toNumber(
    item?.preco ??
      item?.precoUnitario ??
      item?.preco_unit ??
      item?.valorUnitario ??
      item?.valor_unitario ??
      0
  );

  // tipo/unidade (ex.: 'Box', '5un', 'Unit') — use o que existir
  const tipo =
    item?.tipoSelecionado ??
    item?.tipo ??
    item?.unidade ??
    item?.unidadeTipo ??
    null;

  const subtotal = toNumber(item?.subtotal ?? quantidade * precoUnitario);

  // Monte o objeto obedecendo o mínimo exigido pelo tipo Produto do seu domínio.
  // Caso o TS reclame de "excess property", mantenha a asserção "as Produto".
  return {
    id,
    nome,
    quantidade,
    // alguns projetos usam "preco" e outros "precoUnitario"; preencha ambos
    preco: precoUnitario,
    precoUnitario,
    tipo,
    subtotal,
  } as Produto;
}

const ModalRecibo: React.FC<ModalReciboProps> = ({ onClose, idVenda, ...dadosRecibo }) => {
  const { temaAtual } = useTheme();

  // Sempre normalize para Produto[] antes de enviar ao ReciboPDF
  const carrinhoNormalizado: Produto[] = useMemo(() => {
    const itens = Array.isArray(dadosRecibo.carrinho) ? dadosRecibo.carrinho : [];
    return itens.map(normalizarItemParaProduto);
  }, [dadosRecibo.carrinho]);

  // Repassa tudo para o ReciboPDF, substituindo o carrinho pelo normalizado
  const propsRecibo = useMemo(
    () => ({ ...dadosRecibo, carrinho: carrinhoNormalizado }),
    [dadosRecibo, carrinhoNormalizado]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="relative w-full max-w-3xl p-6 rounded-xl shadow-2xl"
        style={{
          backgroundColor: temaAtual.card,
          color: temaAtual.texto,
          border: `4px solid ${temaAtual.destaque}`,
          maxHeight: '90vh',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl"
          aria-label="Fechar Modal"
          style={{ color: temaAtual.texto }}
        >
          ✕
        </button>

        <div className="overflow-y-auto max-h-[70vh] px-1">
          {/* Envia o carrinho já normalizado */}
          <ReciboPDF idVenda={idVenda} {...propsRecibo} />
        </div>
      </div>
    </div>
  );
};

export default ModalRecibo;
