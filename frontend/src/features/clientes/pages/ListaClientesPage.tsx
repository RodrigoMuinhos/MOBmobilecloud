'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

import { Cliente } from '../../../types/domain/cliente.types';
import { Venda } from '../../../types/domain/venda.types';

import CardCliente from '../components/CardCliente';
import TabelaClientes from '../components/TabelaClientes';
import ModalCliente from '../components/ModalCliente';

const ListaClientesPage: React.FC = () => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteModal, setClienteModal] = useState<Cliente | null>(null);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteExpandidoIndex, setClienteExpandidoIndex] = useState<number | null>(null);
  const [busca, setBusca] = useState('');
  const [topCliente, setTopCliente] = useState<Cliente | null>(null);
  const [clienteMaisValor, setClienteMaisValor] = useState<Cliente | null>(null);
  const [totalCpfs, setTotalCpfs] = useState(0);
  const [proximoAniversario, setProximoAniversario] = useState<Cliente | null>(null);
  const [cpfsDuplicados, setCpfsDuplicados] = useState<Set<string>>(new Set());
  const [vendasTotalPorCpf, setVendasTotalPorCpf] = useState<Record<string, number>>({});

  const castData = useCallback((d?: string): string => {
    if (!d) return '2000-01-01';
    return d.length >= 8 ? d : '2000-01-01';
  }, []);

  const exportarClienteParaPDF = useCallback((cliente: Cliente) => {
    const conteudo = `
      <div style="font-family: sans-serif; padding: 16px;">
        <h2>${language.ficha?.titulo ?? 'Ficha do Cliente'}</h2>
        <p><strong>${language.ficha?.nome ?? 'Nome'}:</strong> ${cliente.nome}</p>
        <p><strong>${language.ficha?.cpf ?? 'CPF'}:</strong> ${cliente.cpf}</p>
        <p><strong>${language.ficha?.whatsapp ?? 'WhatsApp'}:</strong> ${cliente.whatsapp}</p>
        <p><strong>${language.ficha?.nascimento ?? 'Nascimento'}:</strong> ${new Date(castData(cliente.nascimento)).toLocaleDateString()}</p>
        ${cliente.email ? `<p><strong>Email:</strong> ${cliente.email}</p>` : ''}
        ${cliente.endereco ? `<p><strong>${language.ficha?.endereco ?? 'Endereço'}:</strong> ${cliente.endereco}</p>` : ''}
        ${cliente.cep ? `<p><strong>${language.ficha?.cep ?? 'CEP'}:</strong> ${cliente.cep}</p>` : ''}
        <p><strong>${language.ficha?.sincronizado ?? 'Sincronizado'}:</strong> ${cliente.sincronizado ? 'Sim' : 'Não'}</p>
      </div>
    `;

    html2pdf()
      .from(conteudo)
      .set({
        margin: 0.5,
        filename: `cliente_${cliente.cpf}.pdf`,
        html2canvas: {},
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      })
      .save();
  }, [castData, language.ficha]);

const atualizarClientes = useCallback(async () => {
  const response = await api.get('/clientes');
  let lista = Array.isArray(response.data) ? response.data : [];

  const clienteVenda = localStorage.getItem('dados_cliente_venda');
  if (clienteVenda) {
    try {
      const novoCliente: Cliente = JSON.parse(clienteVenda);
      if (novoCliente.nome?.length > 0) {
        try {
          const res = await api.post('/clientes', novoCliente);
          if (res.status === 200 || res.status === 201) {
            lista.push(res.data);
          }
        } catch (erro: any) {
          if (erro?.response?.status === 409) {
            const resBusca = await api.get<Cliente>(`/clientes/cpf/${novoCliente.cpf}`);
            if (resBusca.data) lista.push(resBusca.data);
          }
        }
        localStorage.removeItem('dados_cliente_venda');
      }
    } catch (e) {
      localStorage.removeItem('dados_cliente_venda');
    }
  }

  setClientes(lista);
  setTotalCpfs(new Set(lista.map((c: Cliente) => c.cpf)).size);
}, []);


  useEffect(() => {
   const carregarClientes = async () => {
  try {
    const response = await api.get('/clientes');
    let lista = Array.isArray(response.data) ? response.data : [];

    const clienteVenda = localStorage.getItem('dados_cliente_venda');
    if (clienteVenda) {
      try {
        const novoCliente: Cliente = JSON.parse(clienteVenda);
        if (novoCliente.nome?.length > 0) {
          try {
            const res = await api.post('/clientes', novoCliente);
            if (res.status === 200 || res.status === 201) {
              lista.push(res.data);
            }
          } catch (erro: any) {
            if (erro?.response?.status === 409) {
              const resBusca = await api.get<Cliente>(`/clientes/cpf/${novoCliente.cpf}`);
              if (resBusca.data) lista.push(resBusca.data);
            }
          }
          localStorage.removeItem('dados_cliente_venda');
        }
      } catch (e) {
        localStorage.removeItem('dados_cliente_venda');
      }
    }

    setClientes(lista);
    setTotalCpfs(new Set(lista.map((c: Cliente) => c.cpf)).size);

    const duplicados = lista
      .map((c: Cliente) => c.cpf)
      .filter((cpf: string, i: number, arr: string[]) => arr.indexOf(cpf) !== i);
    setCpfsDuplicados(new Set(duplicados));

    const hoje = new Date();
    const ordenadosPorNiver = [...lista]
      .filter((c: Cliente) => !!c.nascimento)
      .sort((a: Cliente, b: Cliente) => {
        const [anoA, mesA, diaA] = castData(a.nascimento).split('-');
        const aDate = new Date(+anoA, +mesA - 1, +diaA, 12);
        aDate.setFullYear(hoje.getFullYear());

        const [anoB, mesB, diaB] = castData(b.nascimento).split('-');
        const bDate = new Date(+anoB, +mesB - 1, +diaB, 12);
        bDate.setFullYear(hoje.getFullYear());

        return aDate.getTime() - bDate.getTime();
      });

    const proximo = ordenadosPorNiver.find((c: Cliente) => {
      const nasc = new Date(castData(c.nascimento));
      nasc.setFullYear(hoje.getFullYear());
      nasc.setHours(12, 0, 0, 0);
      return nasc >= hoje;
    });
    if (proximo) setProximoAniversario(proximo);

    const resVendas = await api.get<Venda[]>('/vendas');
    const vendas = Array.isArray(resVendas.data) ? resVendas.data : [];

    const contagem: Record<string, number> = {};
    const totais: Record<string, number> = {};

    for (const v of vendas) {
      const cpf = v.cliente?.cpf;
      if (!cpf) continue;
      contagem[cpf] = (contagem[cpf] ?? 0) + 1;
      totais[cpf] = (totais[cpf] ?? 0) + (v.total || 0);
    }

    setVendasTotalPorCpf(totais);

    const cpfTop = Object.entries(contagem).sort((a, b) => b[1] - a[1])[0]?.[0];
    const cpfValor = Object.entries(totais).sort((a, b) => b[1] - a[1])[0]?.[0];

    if (cpfTop) setTopCliente(lista.find((c: Cliente) => c.cpf === cpfTop) ?? null);
    if (cpfValor) setClienteMaisValor(lista.find((c: Cliente) => c.cpf === cpfValor) ?? null);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
};


    carregarClientes();
  }, [castData]);

  const clientesFiltrados = useMemo(() => {
    if (!Array.isArray(clientes)) return [];
    const termo = busca.toLowerCase().trim();
    if (!termo) return clientes;
    return clientes.filter((c: Cliente) => {
      const cidade = c.cidade?.toLowerCase() || '';
      const estado = c.estado?.toLowerCase() || '';
      return (
        c.nome?.toLowerCase().includes(termo) ||
        c.whatsapp?.includes(termo) ||
        cidade.includes(termo) ||
        estado.includes(termo)
      );
    });
  }, [clientes, busca]);

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
      <h2 className="text-3xl font-bold mb-6" style={{ color: temaAtual.destaque }}>
        {language.ficha?.titulo ?? 'Lista de Clientes'}
      </h2>

      <CardCliente
        topCliente={topCliente}
        totalCpfs={totalCpfs}
        proximoAniversario={proximoAniversario}
        clienteMaisValor={clienteMaisValor}
        abrirModal={setClienteModal}
        temaAtual={temaAtual}
        vendasTotalPorCpf={vendasTotalPorCpf}
      />

      <TabelaClientes
        clientes={clientes}
        clientesFiltrados={clientesFiltrados}
        clienteEditando={clienteEditando}
        clienteExpandidoIndex={clienteExpandidoIndex}
        setClienteEditando={setClienteEditando}
        setClienteExpandidoIndex={setClienteExpandidoIndex}
        exportarClienteParaPDF={exportarClienteParaPDF}
        busca={busca}
        setBusca={setBusca}
        cpfsDuplicados={cpfsDuplicados}
        temaAtual={temaAtual}
        atualizarClientes={atualizarClientes}
      />

      <ModalCliente
        cliente={clienteModal}
        onClose={() => setClienteModal(null)}
        temaAtual={temaAtual}
        vendasTotalPorCpf={vendasTotalPorCpf}
      />
    </div>
  );
};

export default ListaClientesPage;
