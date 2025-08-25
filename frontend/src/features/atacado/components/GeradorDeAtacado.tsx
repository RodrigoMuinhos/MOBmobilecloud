'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import GraficoInvestimentoLucro from './GraficoInvestimentoLucro';
import GraficoDonutUnidades from './GraficoDonutUnidades';
import { FaRegAddressCard } from 'react-icons/fa';
import ModalCadastroMetrica from './ModalCadastroMetrica';

type Simulacao = {
  id: string;
  nome: string;
  studio: string;
  cpfCnpj: string;
  endereco: string;
  tipo: 'Consignado' | 'Pré-venda';
  valorInvestido: number;
  data: string;
};

type Props = {
  simulacaoSelecionada: Simulacao | null;
  onSalvarSimulacao: (simulacao: Simulacao) => void;
};

const GeradorDeAtacado: React.FC<Props> = ({
  simulacaoSelecionada,
  onSalvarSimulacao
}) => {
  const { temaAtual } = useTheme();

  const [valorCompra, setValorCompra] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState<number | null>(null);
  const [valorVenda, setValorVenda] = useState<number | null>(null);
  const [valorVendaVarejo, setValorVendaVarejo] = useState<number | null>(null);
  const [quantidadeVarejo, setQuantidadeVarejo] = useState<number | null>(null);
  const [abrirModal, setAbrirModal] = useState(false);

  // Preencher campos se vier uma simulação do card
  useEffect(() => {
    if (simulacaoSelecionada) {
      const total = simulacaoSelecionada.valorInvestido;
      const caixas = 1; // você pode salvar a quantidade também futuramente
      setValorCompra(total / caixas);
      setQuantidade(caixas);
    }
  }, [simulacaoSelecionada]);

  // Cálculos Atacado
  const unidades = quantidade ? quantidade * 20 : 0;
  const caixas5 = unidades / 4;
  const valorInvestido = valorCompra && quantidade ? valorCompra * quantidade : 0;
  const precoUnidade = valorInvestido && quantidade ? valorInvestido / (quantidade * 20) : 0;
  const precoCaixa5 = precoUnidade * 5;
  const valorTotalVenda = valorVenda && quantidade ? valorVenda * quantidade : 0;
  const lucroTotal = valorTotalVenda - valorInvestido;
  const markup = valorInvestido ? ((valorTotalVenda / valorInvestido) - 1) * 100 : 0;
  const margem = valorTotalVenda ? (lucroTotal / valorTotalVenda) * 100 : 0;

  // Cálculos Varejo
  const precoUnidadeVarejo = valorVendaVarejo ? valorVendaVarejo / 20 : 0;
  const precoCaixa5Varejo = precoUnidadeVarejo * 5;
  const totalLucroVarejo =
    valorCompra && valorVendaVarejo && quantidadeVarejo
      ? (valorVendaVarejo - valorCompra) * quantidadeVarejo
      : 0;
  const markupVarejo =
    valorCompra && valorVendaVarejo
      ? ((valorVendaVarejo / valorCompra) - 1) * 100
      : 0;
  const margemVarejo =
    valorCompra && valorVendaVarejo
      ? ((valorVendaVarejo - valorCompra) / valorVendaVarejo) * 100
      : 0;

  const cardStyle = "p-4 rounded shadow-md w-full text-sm text-center";
  const cardContainer = "grid grid-cols-2 md:grid-cols-4 gap-4 mt-4";

  const inputCard = (
    label: string,
    value: number | null,
    color: 'laranja' | 'verde',
    onChange: (val: number) => void
  ) => {
    const corClass = color === 'laranja'
      ? 'border-l-8 border-orange-400'
      : 'border-l-8 border-green-400';

    const placeholder = `Insira ${label}`;

    return (
      <div className={`flex items-center ${corClass} bg-gray-100 rounded-lg shadow-sm p-4`}>
        <span className="text-black font-bold mr-2">R$</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={value === null || isNaN(value) ? '' : value.toString().replace('.', ',')}
          onChange={(e) => {
            const v = e.target.value.replace(',', '.').replace(/[^\d.]/g, '');
            onChange(Number(v));
          }}
          className="flex-1 bg-transparent focus:outline-none text-lg text-black placeholder:text-black/40"
        />
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6" style={{ color: temaAtual.texto }}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gerador de Atacado</h2>
        <button
          onClick={() => setAbrirModal(true)}
          className="text-indigo-800 hover:text-indigo-900 transition"
          title="Salvar Métricas ou Gerar Relatório"
        >
          <FaRegAddressCard className="text-2xl" />
        </button>
      </div>

      {/* Entradas Atacado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inputCard('o valor de compra (20un)', valorCompra, 'laranja', setValorCompra)}
        <input
          type="number"
          placeholder="Insira a quantidade comprada (caixa de 20un)"
          value={quantidade ?? ''}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          className="bg-gray-100 rounded-lg p-4 shadow-sm text-lg w-full text-black placeholder:text-black/40"
        />
      </div>

      {/* Resumo Atacado */}
      <div className={cardContainer}>
        <div className={cardStyle} style={{ background: temaAtual.card }}>Caixas com 5 un.: <strong>{caixas5}</strong></div>
        <div className={cardStyle} style={{ background: temaAtual.card }}>Preço por unidade: <strong>R$ {precoUnidade.toFixed(2)}</strong></div>
        <div className={cardStyle} style={{ background: temaAtual.card }}>Valor investido: <strong>R$ {valorInvestido.toFixed(2)}</strong></div>
      </div>

      <h2 className="text-xl font-bold mt-10">Simulação de Varejo</h2>

      {/* Entrada Varejo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inputCard('o valor de venda no varejo (20un)', valorVendaVarejo, 'verde', setValorVendaVarejo)}
        <input
          type="number"
          placeholder="Insira a quantidade para varejo (caixa)"
          value={quantidadeVarejo ?? ''}
          onChange={(e) => setQuantidadeVarejo(Number(e.target.value))}
          className="bg-gray-100 rounded-lg p-4 shadow-sm text-lg w-full text-black placeholder:text-black/40"
        />
      </div>

      {/* Resumo Varejo */}
      <div className={cardContainer}>
        <div className={cardStyle} style={{ background: temaAtual.card }}>Preço 5un: <strong>R$ {precoCaixa5Varejo.toFixed(2)}</strong></div>
        <div className={cardStyle} style={{ background: temaAtual.card }}>Preço por unidade: <strong>R$ {precoUnidadeVarejo.toFixed(2)}</strong></div>
        <div className={cardStyle} style={{ background: temaAtual.card }}>Lucro total: <strong>R$ {totalLucroVarejo.toFixed(2)}</strong></div>
        <div className={cardStyle} style={{ background: temaAtual.card }}>Markup: <strong>{markupVarejo.toFixed(1)}%</strong></div>
        <div className={cardStyle} style={{ background: temaAtual.card }}>Margem: <strong>{margemVarejo.toFixed(1)}%</strong></div>
        <div className={cardStyle} style={{ background: temaAtual.card }}>Preço mínimo sugerido: <strong>R$ 145,00</strong></div>
        <div className={cardStyle} style={{
          background: temaAtual.card,
          color: valorVendaVarejo && valorVendaVarejo < 145 ? 'red' : temaAtual.texto
        }}>
          {valorVendaVarejo && valorVendaVarejo < 145 ? 'Abaixo do mínimo!' : 'Acima do mínimo'}
        </div>
      </div>

      {/* Gráficos Atualizados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <GraficoInvestimentoLucro
          valorCompra={valorCompra || 0}
          quantidadeComprada={quantidade || 0}
          valorVenda={valorVenda || 0}
          quantidadeVendida={quantidade || 0}
        />
        <GraficoDonutUnidades
          precoCompra={valorCompra || 0}
          precoVendaVarejo={valorVendaVarejo || 0}
          quantidade={quantidade || 0}
        />
      </div>

      {/* Modal de Métricas */}
      {abrirModal && (
        <ModalCadastroMetrica
          valorInvestido={valorInvestido}
          onClose={() => setAbrirModal(false)}
          onSalvar={onSalvarSimulacao}
        />
      )}
    </div>
  );
};

export default GeradorDeAtacado;