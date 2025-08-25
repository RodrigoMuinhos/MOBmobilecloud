import React, { useEffect, useState } from 'react';
import ModalCNPJ from '../components/ModalCNPJ';
import { capitaisNordeste, ufsNordeste } from '../../../utils/ufsNordeste';
import { useTheme } from '../../../context/ThemeContext';

interface Cliente {
  cnpj?: string | null;
  nomeFantasia?: string | null;
  nomeMatriz?: string | null;
  cidade?: string | null;
  distrito?: string | null;
  uf?: string | null;
  contatos?: string[];
}

const formatarCNPJ = (cnpj: string | number): string =>
  String(cnpj).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

const formatarWhatsApp = (numero: string): string => {
  const n = numero.replace(/\D/g, '');
  return n.length === 11 ? n.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4') : numero;
};

const TabelaClientesValidados: React.FC = () => {
  const { temaAtual } = useTheme();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ufSelecionada, setUfSelecionada] = useState<string>('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, number>>({});
  const [cnpjsValidados, setCnpjsValidados] = useState<string[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      const resposta = await fetch('/DadosClientes/clientesBiblioteca.json');
      const dados = await resposta.json();

      const statusSalvos = JSON.parse(localStorage.getItem('statusClientes') || '{}');
      const validados = JSON.parse(localStorage.getItem('cnpjValidados') || '[]');
      const cnpjs = validados.map((item: any) => String(item.cnpj));

      const dadosCompletos = dados.map((cliente: Cliente) => {
        const cidadeReferencia = cliente.distrito || cliente.cidade;
        if (!cliente.uf && cidadeReferencia) {
          const cidadeNormalizada = cidadeReferencia.trim().toLowerCase();
          const ufDetectada = Object.entries(capitaisNordeste).find(
            ([uf, capital]) => capital === cidadeNormalizada
          );
          if (ufDetectada) {
            return { ...cliente, uf: ufDetectada[0], cidade: cidadeReferencia };
          }
        }
        if (!cliente.cidade && cidadeReferencia) {
          return { ...cliente, cidade: cidadeReferencia };
        }
        return cliente;
      });

      setClientes(dadosCompletos);
      setStatusMap(statusSalvos);
      setCnpjsValidados(cnpjs);
    };

    carregarDados();
  }, []);

  const trocarStatus = (cnpj: string) => {
    const atual = statusMap[cnpj] ?? 0;
    const novo = (atual + 1) % 4;
    const atualizado = { ...statusMap, [cnpj]: novo };
    setStatusMap(atualizado);
    localStorage.setItem('statusClientes', JSON.stringify(atualizado));
  };

  const getCorStatus = (status: number) => {
    switch (status) {
      case 1: return 'bg-yellow-400';
      case 2: return 'bg-green-500';
      case 3: return 'bg-red-700';
      default: return 'bg-blue-400';
    }
  };

  const ordenarPorNome = (lista: Cliente[]) =>
    lista.sort((a, b) =>
      (a.nomeFantasia || a.nomeMatriz || '').localeCompare(b.nomeFantasia || b.nomeMatriz || '')
    );

  const clientesOrdenados = ordenarPorNome(clientes);

  const contagemStatus: Record<number, number> = {};
  clientes.forEach((c) => {
    const cnpj = String(c.cnpj);
    const salvo = cnpjsValidados.includes(cnpj);
    const status = salvo ? 2 : (statusMap[cnpj] ?? 0);
    contagemStatus[status] = (contagemStatus[status] || 0) + 1;
  });

  return (
    <div className="p-4" style={{ background: temaAtual.fundo, color: temaAtual.texto }}>
      <h2 className="text-xl font-bold mb-4">Clientes Validados</h2>

      <div className="text-sm mb-4">
        {[0, 1, 2, 3].map((status) => (
          <span key={status} className="inline-flex items-center mr-4">
            <span className={`w-3 h-3 rounded-full ${getCorStatus(status)} mr-1`} />
            {['Não Conferido', 'Revisar', 'Ativos', 'Inativos'][status]}:{' '}
            <strong>{contagemStatus[status] || 0}</strong>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <select
          className="px-2 py-1 rounded"
          value={ufSelecionada}
          onChange={(e) => setUfSelecionada(e.target.value)}
          style={{ background: temaAtual.card, color: temaAtual.texto }}
        >
          <option value="">Todas UFs</option>
          <option value="-">Sem UF</option>
          {ufsNordeste.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>

        <input
          className="px-2 py-1 rounded border"
          placeholder="Filtrar cidade..."
          value={cidadeFiltro}
          onChange={(e) => setCidadeFiltro(e.target.value)}
          style={{ background: temaAtual.card, color: temaAtual.texto }}
        />

        <select
          className="px-2 py-1 rounded"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          style={{ background: temaAtual.card, color: temaAtual.texto }}
        >
          <option value="">Todos Status</option>
          <option value="0">Não Conferido</option>
          <option value="1">Revisar</option>
          <option value="2">Ativos</option>
          <option value="3">Inativos</option>
        </select>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">CNPJ</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Cidade</th>
            <th className="p-2 text-left">UF</th>
          </tr>
        </thead>
        <tbody style={{ color: temaAtual.texto }}>
          {clientesOrdenados
            .filter((c) => {
              const cidade = (c.cidade || c.distrito || '').toLowerCase();
              const cnpj = String(c.cnpj);
              const salvo = cnpjsValidados.includes(cnpj);
              const status = salvo ? 2 : (statusMap[cnpj] ?? 0);
              const passaUF = ufSelecionada === ''
                ? true
                : ufSelecionada === '-'
                  ? !c.uf || c.uf.trim() === ''
                  : c.uf === ufSelecionada;
              const passaCidade = cidadeFiltro === '' || cidade.includes(cidadeFiltro.toLowerCase());
              const passaStatus = statusFiltro === '' || status === parseInt(statusFiltro);
              return passaUF && passaCidade && passaStatus;
            })
            .map((cliente, index) => {
              const cnpj = String(cliente.cnpj);
              const salvo = cnpjsValidados.includes(cnpj);
              const status = salvo ? 2 : (statusMap[cnpj] ?? 0);
              return (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-2 font-mono" style={{ color: temaAtual.texto }}>{index + 1}</td>
                  <td className="p-2">
                    <button
                      className={`w-4 h-4 rounded-full ${getCorStatus(status)}`}
                      onClick={() => cliente.cnpj && trocarStatus(cnpj)}
                    />
                  </td>
                  <td className="p-2" style={{ color: temaAtual.texto }}>{formatarCNPJ(cliente.cnpj || '')}</td>
                  <td
                    className="p-2 underline cursor-pointer text-blue-400"
                    onClick={() => setClienteSelecionado(cliente)}
                  >
                    {cliente.nomeFantasia || cliente.nomeMatriz || '---'}
                  </td>
                  <td className="p-2" style={{ color: temaAtual.texto }}>{cliente.cidade || cliente.distrito || '---'}</td>
                  <td className="p-2" style={{ color: temaAtual.texto }}>{cliente.uf || '---'}</td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {clienteSelecionado && (
        <ModalCNPJ
          cliente={clienteSelecionado}
          onFechar={() => setClienteSelecionado(null)}
        />
      )}
    </div>
  );
};

export default TabelaClientesValidados;
