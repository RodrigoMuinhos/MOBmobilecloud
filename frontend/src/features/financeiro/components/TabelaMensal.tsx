'use client';

import React, { useState } from 'react';
import { VendaAPI, ItemCarrinhoAPI } from '../../../types/api/vendaApi.types';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';
import LinhaClienteResumo from './LinhaClienteResumo';

interface ClienteAgrupado {
  cpf: string;
  nome: string;
  lista: VendaAPI[];
  total: number;
  itens: number;
  dataFormatada: string;
}

type Props = {
  mesReferencia: string;
  vendas: VendaAPI[];
  onAtualizarVendas: () => void;
  onAbrirRecibo: (venda: VendaAPI) => void;
  onAbrirSelecaoRecibo: (lista: VendaAPI[]) => void;
  setVendaParaEditar: (venda: VendaAPI) => void;
};

const TabelaMensal: React.FC<Props> = ({
  mesReferencia,
  vendas,
  onAtualizarVendas,
  onAbrirRecibo,
  onAbrirSelecaoRecibo,
  setVendaParaEditar,
}) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang];

  const [clienteExpandido, setClienteExpandido] = useState<number | null>(null);

  const clientesAgrupados: ClienteAgrupado[] = Object.entries(
    vendas.reduce<Record<string, VendaAPI[]>>((acc, venda) => {
      const cpf = venda.cliente?.cpf?.replace(/\D/g, '') || 'semCPF';
      if (!acc[cpf]) acc[cpf] = [];
      acc[cpf].push(venda);
      return acc;
    }, {})
  ).map(([cpf, lista]) => {
    const total = lista.reduce((acc, venda) => {
      const carrinho: ItemCarrinhoAPI[] = Array.isArray(venda.carrinho) ? venda.carrinho : [];

      const subtotal = carrinho.reduce((soma, item) => {
        const qtd = Number(item.quantidade) || 0;
        const preco = Number(item.preco ?? item.precoUnitario) || 0;
        return soma + qtd * preco;
      }, 0);

      const desconto = Number(venda.descontoValor) || 0;
      const frete = Number(venda.frete) || 0;
      const acrescimo = Number(venda.acrescimo) || 0;

      return acc + (subtotal - desconto + frete + acrescimo);
    }, 0);

    const totalItens = lista.reduce((acc, venda) => {
      const carrinho: ItemCarrinhoAPI[] = Array.isArray(venda.carrinho) ? venda.carrinho : [];
      return acc + carrinho.reduce((soma, item) => soma + (Number(item.quantidade) || 0), 0);
    }, 0);

    const dataFormatada = lista[0]?.data
      ? new Date(lista[0].data).toLocaleDateString('pt-BR')
      : '';

    return {
      cpf,
      nome: lista[0]?.cliente?.nome ?? lista[0]?.clienteNome ?? '',
      lista,
      total,
      itens: totalItens,
      dataFormatada,
    };
  });

  return (
    <div className="overflow-x-auto">
      <table
        className="min-w-full text-sm border rounded shadow"
        style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}
      >
        <thead
          className="sticky top-0 z-10"
          style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoBranco }}
        >
          <tr>
            <th className="p-2 text-center w-6">#</th>
            <th className="p-2 text-left w-48">{t.vendas.cliente}</th>
            <th className="p-2 text-left w-40">CPF</th>
            <th className="p-2 text-center w-20">{t.relatorio.quantidade}</th>
            <th className="p-2 text-center w-32">{t.relatorio.valorTotal}</th>
            <th className="p-2 text-center w-16">{t.relatorio.pagamento}</th>
            <th className="p-2 text-center w-16">{t.vendas.recibo.titulo}</th>
          </tr>
        </thead>
        <tbody>
          {clientesAgrupados.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">
                {t.relatorio.semDados || 'Nenhuma venda encontrada.'}
              </td>
            </tr>
          ) : (
            clientesAgrupados.map((cliente, index) => (
              <LinhaClienteResumo
                key={`${cliente.cpf}-${index}`}
                cliente={cliente}
                vendas={cliente.lista}
                index={index}
                clienteExpandido={clienteExpandido}
                setClienteExpandido={setClienteExpandido}
                onAtualizarVendas={onAtualizarVendas}
                onAbrirRecibo={onAbrirRecibo}
                onAbrirSelecaoRecibo={onAbrirSelecaoRecibo}
                setVendaParaEditar={setVendaParaEditar}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaMensal;
