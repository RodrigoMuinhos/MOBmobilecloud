'use client';

import React, { useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { useCarrinho } from '../../../../context/CarrinhoContext';

import EtapaCliente from '../etapas/EtapaCliente';
import EtapaProdutosCarrinho from '../etapas/EtapaProdutosCarrinho';
import EtapaFinalizacao from '../etapas/EtapaFinalizacao';

import { Cliente } from '../../../../types/domain/cliente.types';

interface Props {
  onFechar: () => void;
  onFinalizarVenda: () => void;
  onGerarRecibo: () => void;
  cliente: Cliente;
  setCliente: React.Dispatch<React.SetStateAction<Cliente>>;
  dadosFinanceiros: any;
  setDadosFinanceiros: React.Dispatch<React.SetStateAction<any>>;
  isEnviandoVenda: boolean; // NOVO
}

const ModalEtapaVenda: React.FC<Props> = ({
  onFechar,
  onFinalizarVenda,
  onGerarRecibo,
  cliente,
  setCliente,
  dadosFinanceiros,
  setDadosFinanceiros,
  isEnviandoVenda // NOVO
}) => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const idioma = textos[currentLang];
  const { carrinho } = useCarrinho();

  const [etapa, setEtapa] = useState<1 | 2 | 3>(1);

  const avancar = () => {
    if (etapa < 3) setEtapa((prev) => (prev + 1) as 1 | 2 | 3);
  };

  const voltar = () => {
    if (etapa > 1) setEtapa((prev) => (prev - 1) as 1 | 2 | 3);
    else onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div
        className="w-full max-w-4xl rounded-xl shadow-lg relative p-6 overflow-visible"
        style={{
          background: temaAtual.card,
          color: temaAtual.texto,
          position: 'relative',
          zIndex: 9999
        }}
      >
        {/* Botão Fechar */}
        <button
          onClick={onFechar}
          className="absolute top-3 right-3 text-base font-bold"
          style={{
            background: 'transparent',
            color: temaAtual.destaque,
            border: 'none',
            lineHeight: '1',
            padding: 0,
            margin: 0,
            cursor: 'pointer'
          }}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">
          {idioma.vendas?.tituloEtapa || 'Nova Venda - Etapa '}{etapa}
        </h2>

        {etapa === 1 && (
          <EtapaCliente cliente={cliente} setCliente={setCliente} />
        )}

        {etapa === 2 && <EtapaProdutosCarrinho />}

        {etapa === 3 && (
          <EtapaFinalizacao
            cliente={cliente} 
            carrinho={carrinho}
            desconto={dadosFinanceiros.desconto || 0}
            setDesconto={(v) =>
              setDadosFinanceiros((prev: any) => ({ ...prev, desconto: v }))
            }
            frete={dadosFinanceiros.frete || '0'}
            setFrete={(v) =>
              setDadosFinanceiros((prev: any) => ({ ...prev, frete: v }))
            }
            formaPagamento={dadosFinanceiros.formaPagamento || 'Pix'}
            setFormaPagamento={(v) =>
              setDadosFinanceiros((prev: any) => ({ ...prev, formaPagamento: v }))
            }
            parcelas={dadosFinanceiros.parcelas || 1}
            setParcelas={(v) =>
              setDadosFinanceiros((prev: any) => ({ ...prev, parcelas: v }))
            }
            destinoDesconto={dadosFinanceiros.destinoDesconto || ''}
            setDestinoDesconto={(v) =>
              setDadosFinanceiros((prev: any) => ({ ...prev, destinoDesconto: v }))
            }
            onFinalizar={onFinalizarVenda}
            onGerarRecibo={onGerarRecibo}
            onDadosFinanceirosChange={(dados) =>
              setDadosFinanceiros((prev: any) => ({ ...prev, ...dados }))
            }
            isEnviandoVenda={isEnviandoVenda} // NOVO
          />
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={voltar}
            className="px-4 py-2 rounded"
            style={{ background: temaAtual.input, color: temaAtual.texto }}
          >
            {etapa === 1
              ? idioma.geral?.cancelar || 'Cancelar'
              : idioma.geral?.voltar || 'Voltar'}
          </button>

          {etapa < 3 && (
            <button
              onClick={avancar}
              className="px-4 py-2 rounded"
              style={{ background: temaAtual.destaque, color: temaAtual.textoBranco }}
            >
              {idioma.geral?.avancar || 'Avançar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEtapaVenda;
