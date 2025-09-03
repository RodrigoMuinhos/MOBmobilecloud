'use client';
import React from 'react';
import { FaCircle, FaPaperclip } from 'react-icons/fa';
import { VendaAPI } from '../../../types/api/vendaApi.types';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';
import HistoricoComprasCliente from './HistoricoComprasCliente';

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
  onAtualizarVendas: () => void;
  onAbrirRecibo: (venda: VendaAPI) => void;
  onAbrirSelecaoRecibo: (lista: VendaAPI[]) => void;
  setVendaParaEditar: (venda: VendaAPI) => void;
};

const formatarCPF = (cpf: string): string =>
  cpf.replace(/^\D*(\d{3})(\d{3})(\d{3})(\d{2})\D*$/, '$1.$2.$3-$4');

const isPago = (s: VendaAPI['status_pagamento'] | string | undefined) =>
  String(s ?? '').toLowerCase() === 'pago';

const LinhaClienteResumo: React.FC<Props> = ({
  cliente,
  index,
  clienteExpandido,
  setClienteExpandido,
  vendas,
  onAtualizarVendas,
  onAbrirRecibo,
  onAbrirSelecaoRecibo,
}) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang];

  const estaExpandido = clienteExpandido === index;
  const toggleExpandir = () => setClienteExpandido(estaExpandido ? null : index);

  // Agregado: define cor/título
  const total = cliente.lista.length;
  const pagos = cliente.lista.filter((v) => isPago(v.status_pagamento)).length;

  let corStatus = 'text-red-600';
  let titleStatus: string = t.relatorio?.naoPago ?? 'Não pago';

  if (total === 0) {
    corStatus = 'text-gray-400';
    titleStatus = 'Sem vendas';
  } else if (pagos === total) {
    corStatus = 'text-green-600';
    titleStatus = t.financeiro?.valorPago ?? 'Pago';
  } else if (pagos === 0) {
    corStatus = 'text-red-600';
    titleStatus = t.relatorio?.naoPago ?? 'Não pago';
  } else {
    corStatus = 'text-yellow-500';
    titleStatus = 'Parcialmente pago';
  }

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

        {/* Indicador SOMENTE informativo */}
        <td className="p-2 text-center">
          <FaCircle className={`select-none ${corStatus}`} title={titleStatus} aria-label={titleStatus} />
        </td>

        <td className="p-2 text-center">
          <FaPaperclip
            className="text-gray-600 dark:text-gray-300 hover:text-green-600"
            title={t.vendas?.recibo?.ver ?? 'Ver Recibo'}
            onClick={(e) => {
              e.stopPropagation();
              if (cliente.lista.length === 1) onAbrirRecibo(cliente.lista[0]);
              else onAbrirSelecaoRecibo(cliente.lista);
            }}
          />
        </td>
      </tr>

      {estaExpandido && (
        <HistoricoComprasCliente
          lista={cliente.lista}
          onAtualizarVendas={onAtualizarVendas}
        />
      )}
    </>
  );
};

export default LinhaClienteResumo;
