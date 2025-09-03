'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';

// ✅ Tipos da API (não usar os de domínio)
import { ClienteAPI } from '../../../../types/api/clienteApi.types';
import { VendaAPI } from '../../../../types/api/vendaApi.types';

interface Props {
  cliente: ClienteAPI;
  vendasDoCliente: VendaAPI[];
  onFechar: () => void;
  onAtualizarNome: (novoNome: string) => void;
}

const cpfMask = (cpf?: string | null) => {
  const v = (cpf || '').replace(/\D/g, '');
  return v.length === 11 ? v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : v;
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const totalDaVenda = (v: VendaAPI): number => {
  // soma robusta: totalFinal -> total -> (subtotal + frete + acrescimo - descontoValor)
  const tf = Number(v.totalFinal ?? NaN);
  if (Number.isFinite(tf)) return tf;

  const t = Number((v as any).total ?? NaN);
  if (Number.isFinite(t)) return t;

  const subtotal = Number(v.subtotal ?? 0) || 0;
  const frete = Number(v.frete ?? 0) || 0;
  const acrescimo = Number(v.acrescimo ?? 0) || 0;
  const desconto = Number(v.descontoValor ?? 0) || 0;
  return subtotal + frete + acrescimo - desconto;
};

const ModalAnaliseCliente: React.FC<Props> = ({ cliente, vendasDoCliente = [], onFechar }) => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const idioma = textos[currentLang];

  // Contagem de produtos via carrinho (API)
  const produtosContagem: Record<string, number> = {};
  vendasDoCliente.forEach((venda) => {
    venda.carrinho?.forEach((item: any) => {
      const nome = (item?.nome || item?.produtoNome || 'Produto') as string;
      const q = Number(item?.quantidade ?? 0) || 0;
      produtosContagem[nome] = (produtosContagem[nome] || 0) + q;
    });
  });

  const topProdutos = Object.entries(produtosContagem)
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  const totalGasto = vendasDoCliente.reduce((soma, v) => soma + totalDaVenda(v), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div
        className="w-full max-w-2xl p-6 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]"
        style={{ background: temaAtual.card, color: temaAtual.texto }}
      >
        <h2 className="text-xl font-bold mb-4">
          {idioma.clientes.analiseDe} {cliente?.nome || ''}
        </h2>

        <p className="mb-1">
          <strong>{idioma.clientes.cpf}:</strong> {cpfMask(cliente?.cpf) || idioma.geral?.naoInformado}
        </p>
        <p className="mb-1">
          <strong>{idioma.clientes.nascimento}:</strong>{' '}
          {cliente?.nascimento || idioma.geral?.naoInformado}
        </p>
        <p className="mb-1">
          <strong>{idioma.clientes.numeroCompras}:</strong> {vendasDoCliente.length}
        </p>
        <p className="mb-4">
          <strong>{idioma.clientes.totalGasto}:</strong> {formatBRL(totalGasto)}
        </p>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">{idioma.clientes.topProdutos}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProdutos}>
              <XAxis dataKey="nome" stroke={temaAtual.texto} />
              <YAxis stroke={temaAtual.texto} />
              <Tooltip
                contentStyle={{
                  backgroundColor: temaAtual.card,
                  borderColor: temaAtual.destaque,
                  color: temaAtual.texto,
                }}
              />
              <Bar dataKey="quantidade" fill={temaAtual.destaque} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 text-right">
          <button
            className="px-4 py-2 rounded hover:opacity-90"
            style={{ background: temaAtual.destaque, color: temaAtual.card }}
            onClick={onFechar}
          >
            {idioma.geral?.fechar || 'Fechar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAnaliseCliente;
