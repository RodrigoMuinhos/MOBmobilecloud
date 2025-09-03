'use client';
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { BsCircleFill } from 'react-icons/bs';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';

// ✅ Use os tipos da API, não do domínio antigo
import { ClienteAPI } from '../../../../types/api/clienteApi.types';
import { VendaAPI } from '../../../../types/api/vendaApi.types';

export type ClienteResumoAPI = ClienteAPI & {
  totalGasto: number;
  numeroCompras: number;
  ultimaCompra: string; // ISO
};

type CorPermitida = 'cinza' | 'azul' | 'amarelo' | 'verde' | 'roxo';

interface Props {
  clientes: ClienteResumoAPI[];
  statusMap: Record<string, string>; // pode vir qualquer string do backend; sanitizamos abaixo
  mensagensPorCor: Record<string, string>;
  filtro: string;
  vendas: VendaAPI[]; // mantido por compatibilidade (mesmo que não use aqui)
  onStatusClick: (cpf: string, novaCor: CorPermitida) => void;
  onAbrirModal: (dados: { cpf: string; numero: string }) => void;
  onAbrirAnalise: (cliente: ClienteAPI) => void;
}

const cores: CorPermitida[] = ['cinza', 'azul', 'amarelo', 'verde', 'roxo'];
const classesCor: Record<CorPermitida, string> = {
  cinza: '#9ca3af',
  azul: '#3b82f6',
  amarelo: '#eab308',
  verde: '#22c55e',
  roxo: '#a855f7',
};

// --- helpers
const mapCor = (cor?: string): CorPermitida =>
  (cores.includes(cor as CorPermitida) ? (cor as CorPermitida) : 'cinza');

const proximaCor = (corAtual?: string): CorPermitida => {
  const atual = mapCor(corAtual);
  const idx = cores.indexOf(atual);
  return cores[(idx + 1) % cores.length];
};

const cpfLimpo = (cpf?: string | null) => (cpf || '').replace(/\D/g, '');
const nomeSeguro = (nome?: string | null) => (nome || '').trim();

const formatarCPF = (cpf: string) =>
  cpf.length === 11 ? cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : cpf;

const calcularDiasDesde = (dataISO?: string | null) => {
  if (!dataISO) return 0;
  const hoje = new Date();
  const data = new Date(dataISO);
  return Math.floor((+hoje - +data) / (1000 * 60 * 60 * 24));
};

const formatarBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

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

  const filtroNome = filtro.toLowerCase();
  const filtroCpf = filtro.replace(/\D/g, '');

  const clientesFiltrados = clientes.filter((c) => {
    const nome = nomeSeguro(c.nome).toLowerCase();
    const cpf = cpfLimpo(c.cpf);
    return nome.includes(filtroNome) || cpf.includes(filtroCpf);
  });

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
            const cpf = cpfLimpo(cliente.cpf);
            const cor = mapCor(statusMap[cpf]); // ✅ sanitiza
            const dias = calcularDiasDesde(cliente.ultimaCompra);

            const rotuloStatus =
              dias > 30
                ? idioma.vendas?.inativo
                : dias > 15
                ? idioma.vendas?.semCompra
                : idioma.vendas?.clienteAtivo;

            const mensagemWpp =
              mensagensPorCor[cor] || idioma.mensagens?.mensagemPadrao || '';

            return (
              <tr
                key={cliente.id ?? cpf ?? String(i)}
                style={{
                  borderBottom: `1px solid ${temaAtual.contraste}`,
                  background: 'transparent',
                }}
                className="hover:brightness-110 transition"
              >
                <td className="p-2">
                  <button onClick={() => onStatusClick(cpf, proximaCor(cor))}>
                    <BsCircleFill style={{ color: classesCor[cor] }} />
                  </button>
                </td>

                <td
                  onClick={() => onAbrirAnalise(cliente)}
                  className="p-2 cursor-pointer underline"
                  style={{ color: temaAtual.destaque }}
                >
                  {nomeSeguro(cliente.nome)}
                </td>

                <td className="p-2">{formatarCPF(cpf)}</td>

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

                <td className="p-2">{formatarBRL(cliente.totalGasto)}</td>

                <td className="p-2">
                  <button
                    title={mensagemWpp}
                    onClick={() =>
                      onAbrirModal({
                        cpf,
                        numero: (cliente.whatsapp || '').replace(/\D/g, ''),
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
