'use client';
import React from 'react';
import { FaCircle, FaPaperclip } from 'react-icons/fa';
import { VendaAPI } from '../../../types/api/vendaApi.types'; // ✅ novo tipo vindo da API
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';
import HistoricoComprasCliente from './HistoricoComprasCliente';
import api from '../../../services/api';

type ClienteAgrupado = {
  cpf: string;
  nome: string;
  lista: VendaAPI[];
  total: number;
  itens: number;
  dataFormatada: string;
};

type Props = {
  cliente: ClienteAgrupado;
  index: number;
  clienteExpandido: number | null;
  setClienteExpandido: (i: number | null) => void;
  vendas: VendaAPI[];
  onAtualizarVendas: (v: VendaAPI[]) => void;
  onAbrirRecibo: (venda: VendaAPI) => void;
  onAbrirSelecaoRecibo: (lista: VendaAPI[]) => void;
  setVendaParaEditar: (venda: VendaAPI) => void;
};

const formatarCPF = (cpf: string): string =>
  cpf.replace(/^\D*(\d{3})(\d{3})(\d{3})(\d{2})\D*$/, '$1.$2.$3-$4');

const LinhaClienteResumo: React.FC<Props> = ({
  cliente,
  index,
  clienteExpandido,
  setClienteExpandido,
  vendas,
  onAtualizarVendas,
  onAbrirRecibo,
  onAbrirSelecaoRecibo,
  setVendaParaEditar,
}) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang];

  const estaExpandido = clienteExpandido === index;
  const toggleExpandir = () => setClienteExpandido(estaExpandido ? null : index);

  const totalDeVendas = cliente.lista.length;
  const vendasPagas = cliente.lista.filter(venda => venda.status_pagamento === 'pago').length;

  let corStatus = 'text-red-600';
  let titleStatus = t.relatorio.naoPago;

  if (vendasPagas === totalDeVendas) {
    corStatus = 'text-green-600';
    titleStatus = t.financeiro?.valorPago || 'Pago';
  } else if (vendasPagas > 0) {
    corStatus = 'text-yellow-500';
    titleStatus = 'Parcialmente Pago';
  }

  const alternarStatusTodos = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const vendasDoCliente = vendas.filter(v => v.cliente?.cpf === cliente.cpf);
    const todasPagas = vendasDoCliente.every(v => v.status_pagamento === 'pago');
    const novoStatus: 'pago' | 'pendente' = todasPagas ? 'pendente' : 'pago';

    try {
      await Promise.all(
        vendasDoCliente.map((v) =>
          api.put(`/vendas/${v.id}`, {
            ...v,
            status_pagamento: novoStatus,
          })
        )
      );

      const atualizadas = vendas.map(venda =>
        venda.cliente?.cpf === cliente.cpf ? { ...venda, status_pagamento: novoStatus } : venda
      );
      onAtualizarVendas(atualizadas);
    } catch (error) {
      console.error('Erro ao atualizar status das vendas:', error);
      alert('Erro ao atualizar status das vendas. Verifique sua conexão.');
    }
  };

  return (
    <>
      <tr
        className="cursor-pointer border-b"
        style={{ borderColor: temaAtual.destaque }}
        onClick={toggleExpandir}
      >
        <td className="p-2 text-center">{index + 1}</td>
        <td className="p-2 text-left text-green-700 underline">{cliente.nome}</td>
        <td className="p-2 text-left">{formatarCPF(cliente.cpf)}</td>
        <td className="p-2 text-center">{cliente.itens}</td>
        <td className="p-2 text-center">
          {Number.isFinite(cliente.total)
            ? cliente.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'R$ 0,00'}
        </td>
        <td className="p-2 text-center">
          <FaCircle
            className={`cursor-pointer ${corStatus}`}
            title={titleStatus}
            onClick={alternarStatusTodos}
          />
        </td>
    <td className="p-2 text-center">
  <FaPaperclip
    className="text-gray-600 dark:text-gray-300 hover:text-green-600"
    title={t.vendas?.recibo?.ver ?? 'Ver Recibo'} 
    onClick={(e) => {
      e.stopPropagation();
      if (cliente.lista.length === 1) {
        onAbrirRecibo(cliente.lista[0]);
      } else {
        onAbrirSelecaoRecibo(cliente.lista);
      }
    }}
  />
</td>

      </tr>

      {estaExpandido && (
        <HistoricoComprasCliente
          lista={cliente.lista}
          vendas={vendas}
          onAtualizarVendas={onAtualizarVendas}
        />
      )}
    </>
  );
};

export default LinhaClienteResumo;
