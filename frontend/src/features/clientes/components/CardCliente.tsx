'use client';
import React from 'react';
import {
  FaCrown,
  FaUsers,
  FaBirthdayCake,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { Cliente } from '../../../types/domain/cliente.types';
import { useLanguage } from '../../../context/LanguageContext';
import { formatarData } from '../../../utils/formatadores';

interface Props {
  topCliente: Cliente | null;
  totalCpfs: number;
  proximoAniversario: Cliente | null;
  clienteMaisValor: Cliente | null;
  abrirModal: (cliente: Cliente) => void;
  vendasTotalPorCpf: Record<string, number>;
  temaAtual: {
    card: string;
    texto: string;
    destaque: string;
  };
}

const CardCliente: React.FC<Props> = ({
  topCliente,
  totalCpfs,
  proximoAniversario,
  clienteMaisValor,
  abrirModal,
  vendasTotalPorCpf,
  temaAtual,
}) => {
  const { language } = useLanguage();
  const t = language.ficha;

  const estiloCard = {
    backgroundColor: temaAtual.card,
    color: temaAtual.texto,
    borderColor: temaAtual.destaque,
    minHeight: '80px',
  };

  const Card = ({ icon, title, subtitle, extra, onClick }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    extra?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div
      className={`rounded shadow px-4 py-2 flex flex-col justify-center border ${onClick ? 'cursor-pointer' : ''}`}
      style={estiloCard}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="leading-snug">
          <p className="text-xs opacity-80 mb-0.5">{title}</p>
          <p className="font-bold text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{subtitle}</p>
        </div>
      </div>
      {extra && <div className="text-xs mt-1 text-white opacity-90 leading-tight">{extra}</div>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {topCliente && (
        <Card
          icon={<FaCrown className="text-yellow-500" />}
          title={t?.maisComprou ?? 'Mais comprou'}
          subtitle={topCliente.nome}
          onClick={() => abrirModal(topCliente)}
        />
      )}

      <Card
        icon={<FaUsers className="text-2xl" style={{ color: temaAtual.destaque }} />}
        title={t?.totalCpfs ?? 'Total de CPFs'}
        subtitle={totalCpfs.toString()}
      />

      {proximoAniversario && (
        <Card
          icon={<FaBirthdayCake className="text-pink-500" />}
          title={t?.proximoAniversario ?? 'Aniversário'}
          subtitle={proximoAniversario.nome}
          extra={proximoAniversario.nascimento ? formatarData(proximoAniversario.nascimento) : '---'}
          onClick={() => abrirModal(proximoAniversario)}
        />
      )}

      {clienteMaisValor && (
        <Card
          icon={<FaMoneyBillWave className="text-green-500" />}
          title={t?.maiorValorCompras ?? 'Mais gastou'}
          subtitle={clienteMaisValor.nome}
          extra={
            <span className="text-green-400">
              R$ {(vendasTotalPorCpf[clienteMaisValor.cpf] ?? 0).toFixed(2)}
              {(vendasTotalPorCpf[clienteMaisValor.cpf] ?? 0) > 1000 && (
                <span
                  className="ml-1 text-yellow-400 animate-pulse"
                  title={t?.vip ?? 'VIP'}
                >
                  ★
                </span>
              )}
            </span>
          }
          onClick={() => abrirModal(clienteMaisValor)}
        />
      )}
    </div>
  );
};

export default CardCliente;
