'use client';

import React, { useEffect, useState, useEffect as useLayoutEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import api from '../../../../services/api';
import { CartItem } from '../../../../types/domain/carrinho';
import { Cliente } from '../../../../types/domain/cliente.types';
import BotoesFinalizacao from '../botao/BotoesFinalizacao';

interface Props {
  cliente: Cliente;
  carrinho: CartItem[];
  desconto: number;
  setDesconto: (v: number) => void;
  frete: string;
  setFrete: (v: string) => void;
  formaPagamento: string;
  setFormaPagamento: (v: string) => void;
  parcelas: number;
  setParcelas: (v: number) => void;
  destinoDesconto: string;
  setDestinoDesconto: (v: string) => void;
  onFinalizar: () => void;
  onGerarRecibo: () => void;
  onDadosFinanceirosChange: (dados: any) => void;
  isEnviandoVenda: boolean; // NOVO
}

interface MembroExtra {
  id: string;
  nome: string;
  avatar: string;
  usos: number;
  comissao: number;
  salvo: boolean;
}

const EtapaFinalizacao: React.FC<Props> = ({
  cliente,
  carrinho,
  desconto,
  setDesconto,
  frete,
  setFrete,
  formaPagamento,
  setFormaPagamento,
  parcelas,
  setParcelas,
  destinoDesconto,
  setDestinoDesconto,
  onFinalizar,
  onGerarRecibo,
  onDadosFinanceirosChange,
  isEnviandoVenda, // NOVO
}) => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.vendas;

  const [membrosExtras, setMembrosExtras] = useState<MembroExtra[]>([]);

  useEffect(() => {
    const carregarMembros = async () => {
      try {
        const response = await api.get('/membros');
        setMembrosExtras(response.data);
      } catch (error) {
        console.error('Erro ao carregar membros:', error);
      }
    };
    carregarMembros();
  }, []);

  const subtotal = carrinho.reduce((total, produto) => total + produto.subtotal, 0);
  const valorDesconto = subtotal * (desconto / 100);
  const valorFrete = parseFloat((frete || '0').replace(',', '.')) || 0;

  const tabelaJuros: Record<number, number> = {
    1: 0, 2: 4.25, 3: 6.45, 4: 8.45, 5: 10.25, 6: 11.95,
    7: 13.65, 8: 15.25, 9: 16.85, 10: 18.45, 11: 19.75, 12: 21.25,
  };

  const acrescimo = formaPagamento === 'Cartão de Crédito'
    ? (subtotal * tabelaJuros[parcelas]) / 100
    : 0;

  const totalFinal = subtotal - valorDesconto + valorFrete + acrescimo;

  useLayoutEffect(() => {
    onDadosFinanceirosChange({
      subtotal,
      descontoPercentual: desconto,
      descontoValor: valorDesconto,
      destinoDesconto,
      frete: valorFrete,
      acrescimo,
      formaPagamento,
      parcelas,
      totalFinal,
    });
  }, [carrinho, desconto, frete, formaPagamento, parcelas, destinoDesconto]);

  return (
    <div className="space-y-6">
      {/* Desconto e membros */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            const opcoes = [0, 5, 10];
            const proximo = opcoes[(opcoes.indexOf(desconto) + 1) % opcoes.length];
            setDesconto(proximo);
          }}
          className="px-3 py-2 rounded text-sm font-semibold"
          style={{
            backgroundColor: temaAtual.destaque,
            color: temaAtual.textoBranco,
            border: `1px solid ${temaAtual.contraste}`,
          }}
        >
          {t.cupom} {desconto}%
        </button>

        {membrosExtras.map((m) => (
          <button
            key={m.id}
            onClick={() => setDestinoDesconto(m.id)}
            className={`px-3 py-2 rounded text-sm font-semibold ${
              destinoDesconto === m.id ? 'ring-2 ring-offset-1' : ''
            }`}
            style={{
              backgroundColor: destinoDesconto === m.id ? temaAtual.destaque : temaAtual.card,
              color: destinoDesconto === m.id ? temaAtual.textoBranco : temaAtual.texto,
              border: `1px solid ${temaAtual.contraste}`,
            }}
          >
            {m.nome}
          </button>
        ))}
      </div>

      {/* Frete */}
      <input
        type="text"
        placeholder={t.fretePlaceholder}
        className="w-full border p-2 rounded italic"
        value={frete}
        onChange={(e) => setFrete(e.target.value)}
        style={{
          backgroundColor: temaAtual.input,
          color: temaAtual.texto,
          borderColor: temaAtual.contraste,
        }}
      />

      {/* Pagamento e parcelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-semibold">{t.formaPagamento}</label>
          <select
            value={formaPagamento}
            onChange={(e) => {
              setFormaPagamento(e.target.value);
              if (e.target.value !== 'Cartão de Crédito') setParcelas(1);
            }}
            className="w-full border p-2 rounded"
            style={{
              backgroundColor: temaAtual.input,
              color: temaAtual.texto,
              borderColor: temaAtual.contraste,
            }}
          >
            <option value="Pix">Pix</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Cartão de Débito">Cartão de Débito</option>
            <option value="Cartão de Crédito">Cartão de Crédito</option>
          </select>
        </div>

        {formaPagamento === 'Cartão de Crédito' && (
          <div>
            <label className="block mb-1 font-semibold">{t.parcelas}</label>
            <select
              value={parcelas}
              onChange={(e) => setParcelas(Number(e.target.value))}
              className="w-full border p-2 rounded"
              style={{
                backgroundColor: temaAtual.input,
                color: temaAtual.texto,
                borderColor: temaAtual.contraste,
              }}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}x
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="text-right font-bold text-sm mt-4">
        <p>Subtotal: R$ {subtotal.toFixed(2)}</p>
        <p>Desconto: -R$ {valorDesconto.toFixed(2)}</p>
        <p>Frete: +R$ {valorFrete.toFixed(2)}</p>
        {formaPagamento === 'Cartão de Crédito' && (
          <>
            <p>Acréscimo: +R$ {acrescimo.toFixed(2)}</p>
            <p className="text-xs opacity-80">
              {parcelas}x de R$ {(totalFinal / parcelas).toFixed(2)}
            </p>
          </>
        )}
        <p className="text-lg mt-2" style={{ color: temaAtual.destaque }}>
          Total Final: R$ {totalFinal.toFixed(2)}
        </p>
      </div>

      {/* Botões */}
      <div className="flex flex-col items-end gap-2 pt-6 border-t mt-6">
        <BotoesFinalizacao
          cliente={cliente}
          carrinho={carrinho}
          subtotal={subtotal}
          desconto={desconto}
          valorDesconto={valorDesconto}
          destinoDesconto={destinoDesconto}
          valorFrete={valorFrete}
          acrescimo={acrescimo}
          formaPagamento={formaPagamento}
          parcelas={parcelas}
          totalFinal={totalFinal}
          onFinalizar={onFinalizar}
          onGerarRecibo={onGerarRecibo}
          temaAtual={temaAtual}
          t={t}
          isEnviandoVenda={isEnviandoVenda} // NOVO
        />
      </div>
    </div>
  );
};

export default EtapaFinalizacao;
