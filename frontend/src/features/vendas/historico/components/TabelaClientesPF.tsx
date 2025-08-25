'use client';
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { BsCircleFill } from 'react-icons/bs';
import { Cliente } from '../../../../types/domain/cliente.types';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { Venda } from '../../../../types/domain/venda.types';

type ClienteResumo = Cliente & {
  totalGasto: number;
  numeroCompras: number;
  ultimaCompra: string;
};

interface Props {
  clientes: ClienteResumo[];
  statusMap: Record<string, string>;
  mensagensPorCor: Record<string, string>;
  filtro: string;
  vendas: Venda[];
  onStatusClick: (cpf: string, novaCor: string) => void;
  onAbrirModal: (dados: { cpf: string; numero: string }) => void;
  onAbrirAnalise: (cliente: Cliente) => void;
}

const cores = ['cinza', 'azul', 'amarelo', 'verde', 'roxo'] as const;
const classesCor: Record<string, string> = {
  cinza: '#9ca3af',
  azul: '#3b82f6',
  amarelo: '#eab308',
  verde: '#22c55e',
  roxo: '#a855f7',
};

const formatarCPF = (cpf: string) =>
  cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');

const calcularDiasDesde = (dataISO: string) => {
  if (!dataISO) return 0;
  const hoje = new Date();
  const data = new Date(dataISO);
  return Math.floor((+hoje - +data) / (1000 * 60 * 60 * 24));
};

const proximaCor = (corAtual: string): string => {
  const idx = cores.indexOf(corAtual as any);
  return cores[(idx + 1) % cores.length];
};

const TabelaClientesPF: React.FC<Props> = ({
  clientes,
  statusMap,
  mensagensPorCor,
  onStatusClick,
  onAbrirModal,
  onAbrirAnalise,
  filtro,
}) => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const idioma = textos[currentLang];

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      c.cpf.includes(filtro)
  );

  return (
    <div
      className="overflow-auto mt-4 rounded-lg shadow"
      style={{ background: temaAtual.card, color: temaAtual.texto }}
    >
      <table className="min-w-full text-sm">
        <thead>
          <tr style={{ background: temaAtual.fundoAlt, color: temaAtual.texto }}>
            <th className="p-2 text-left border-b" style={{ borderColor: temaAtual.contraste }}>{idioma.vendas?.status}</th>
            <th className="p-2 text-left border-b" style={{ borderColor: temaAtual.contraste }}>{idioma.vendas?.nome}</th>
            <th className="p-2 text-left border-b" style={{ borderColor: temaAtual.contraste }}>{idioma.vendas?.cpf}</th>
            <th className="p-2 text-left border-b" style={{ borderColor: temaAtual.contraste }}>{idioma.vendas?.ultimaCompra}</th>
            <th className="p-2 text-left border-b" style={{ borderColor: temaAtual.contraste }}>{idioma.vendas?.compras}</th>
            <th className="p-2 text-left border-b" style={{ borderColor: temaAtual.contraste }}>{idioma.vendas?.totalGasto}</th>
            <th className="p-2 text-left border-b" style={{ borderColor: temaAtual.contraste }}>{idioma.vendas?.contato}</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((cliente, i) => {
            const cor = statusMap[cliente.cpf] || 'cinza';
            const dias = calcularDiasDesde(cliente.ultimaCompra);

            const rotuloStatus =
              dias > 30
                ? idioma.vendas?.inativo
                : dias > 15
                ? idioma.vendas?.semCompra
                : idioma.vendas?.clienteAtivo;

            const mensagemWpp = mensagensPorCor[cor] || idioma.mensagens?.mensagemPadrao || '';

            return (
              <tr
                key={i}
                style={{
                  borderBottom: `1px solid ${temaAtual.contraste}`,
                  background: 'transparent',
                }}
                className="hover:brightness-110 transition"
              >
                <td className="p-2">
                  <button onClick={() => onStatusClick(cliente.cpf, proximaCor(cor))}>
                    <BsCircleFill style={{ color: classesCor[cor] }} />
                  </button>
                </td>

                <td
                  onClick={() => onAbrirAnalise(cliente)}
                  className="p-2 cursor-pointer underline"
                  style={{ color: temaAtual.destaque }}
                >
                  {cliente.nome}
                </td>

                <td className="p-2">{formatarCPF(cliente.cpf)}</td>

                <td className="p-2">
                  <div className="flex flex-col">
                    <span>
                      {dias} {idioma.vendas?.diasAtras}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: temaAtual.textoClaro }}>
                      {rotuloStatus}
                    </span>
                  </div>
                </td>

                <td className="p-2">{cliente.numeroCompras}</td>

                <td className="p-2">R$ {cliente.totalGasto.toFixed(2)}</td>

                <td className="p-2">
                  <button
                    title={mensagemWpp}
                    onClick={() =>
                      onAbrirModal({
                        cpf: cliente.cpf,
                        numero: cliente.whatsapp,
                      })
                    }
                    style={{ color: '#22c55e' }}
                  >
                    <FaWhatsapp />
                  </button>
                </td>
              </tr>
            );
          })}

          {clientesFiltrados.length === 0 && (
            <tr>
              <td
                className="p-4 text-center italic"
                colSpan={7}
                style={{ color: temaAtual.textoClaro }}
              >
                {idioma.geral?.nenhumResultado || 'Nenhum resultado.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaClientesPF;
