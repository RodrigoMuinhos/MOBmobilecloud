import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';

import ResumoCards from '../components/ResumoCards';
import GraficoPorUF from '../components/GraficoPorUF';
import GraficoDistribuicaoUFBar from '../components/GraficoDistribuicaoUFBar';
import GraficoTopCidadesBar from '../components/GraficoTopCidadesBar';
import GraficoDistribuicaoCidadePizza from '../components/GraficoDistribuicaoCidadePizza';

interface Cliente {
  distrito?: string | null;
  uf?: string | null;
  validado?: string | null;
}

const cores = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042',
  '#d0ed57', '#a4de6c', '#8dd1e1', '#83a6ed',
  '#ffbb28', '#ff6666', '#00c49f'
];

const GraficosDadosPage: React.FC = () => {
  const { temaAtual } = useTheme();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ufFiltro, setUfFiltro] = useState<string>('');
  const [statusFiltro, setStatusFiltro] = useState<string>('');

  useEffect(() => {
    fetch('/DadosClientes/clientesBiblioteca.json')
      .then((res) => res.json())
      .then((data: Cliente[]) => {
        setClientes(data);
      });
  }, []);

  const listaUFsUnicas = Array.from(new Set(
    clientes
      .map((c) => (typeof c.uf === 'string' ? c.uf.trim().toUpperCase() : ''))
      .filter((uf) => uf !== '')
  )).sort();

  const clientesFiltrados = clientes.filter((c) => {
    const uf = c.uf?.trim().toUpperCase();
    const status = c.validado;
    const atendeUF = ufFiltro ? uf === ufFiltro : true;
    const atendeStatus = statusFiltro ? status === statusFiltro : true;
    return atendeUF && atendeStatus;
  });

  const contagem = {
    porCidade: {} as Record<string, number>,
    porUF: {} as Record<string, number>,
    valido: 0,
    invalido: 0,
  };

  clientesFiltrados.forEach((c) => {
    const cidade = c.distrito?.trim();
    const uf = c.uf?.trim().toUpperCase();
    if (cidade) contagem.porCidade[cidade] = (contagem.porCidade[cidade] || 0) + 1;
    if (uf) contagem.porUF[uf] = (contagem.porUF[uf] || 0) + 1;
    if (c.validado === 'Válido') contagem.valido++;
    else contagem.invalido++;
  });

  const listaCidades = Object.entries(contagem.porCidade)
    .map(([cidade, quantidade]) => ({ cidade, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const listaUFs = Object.entries(contagem.porUF)
    .map(([uf, quantidade]) => ({ uf, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  return (
    <div className="p-6 space-y-12 min-h-screen" style={{ background: temaAtual.fundo, color: temaAtual.texto }}>
      <h1 className="text-2xl font-bold mb-6">Dashboard da Biblioteca de Dados</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={ufFiltro}
          onChange={(e) => setUfFiltro(e.target.value)}
          className="px-3 py-1 border rounded text-sm"
          style={{ color: temaAtual.texto, background: temaAtual.card }}
        >
          <option value="">Todas as UFs</option>
          {listaUFsUnicas.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>

        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="px-3 py-1 border rounded text-sm"
          style={{ color: temaAtual.texto, background: temaAtual.card }}
        >
          <option value="">Todos os Status</option>
          <option value="Válido">Válido</option>
          <option value="Inválido">Inválido</option>
        </select>
      </div>

      {/* Cards de Resumo */}
      <ResumoCards
        total={clientesFiltrados.length}
        totalCidades={listaCidades.length}
        totalUFs={listaUFsUnicas.length}
      />

      {/* Válidos vs Inválidos */}
      <GraficoPorUF valido={contagem.valido} invalido={contagem.invalido} />

      {/* Por UF */}
      <GraficoDistribuicaoUFBar listaUFs={listaUFs} cores={cores} />

      {/* Top 10 Cidades */}
      <GraficoTopCidadesBar listaCidades={listaCidades.slice(0, 10)} />

      {/* Por Cidade - Pizza */}
      <GraficoDistribuicaoCidadePizza listaCidades={listaCidades.slice(0, 10)} cores={cores} />
    </div>
  );
};

export default GraficosDadosPage;
