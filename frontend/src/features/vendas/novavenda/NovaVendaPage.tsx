// frontend/src/features/vendas/novavenda/NovaVendaPage.tsx
'use client';

import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import ModalEtapaVenda from './modais/ModalEtapaVenda';
import ModalRecibo, { ModalReciboProps } from './modais/ModalReciboVenda';
import { Cliente, clienteVazio } from '../../../types/domain/cliente.types';
import api from '../../../services/api';
import { useCarrinho } from '../../../context/CarrinhoContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
// import { montarVendaFinal } from '../../../utils/venda/montarVendaFinal';
import { montarVendaSimulada } from '../../../utils/venda/montarVendaSimulada';
import { CartItem } from '../../../types/domain/carrinho';

const NovaVendaPage: React.FC = () => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.vendas;

  const { carrinho, limparCarrinho } = useCarrinho();

  const [abrirModal, setAbrirModal] = useState(false);
  const [mostrarModalRecibo, setMostrarModalRecibo] = useState(false);
  const [dadosRecibo, setDadosRecibo] = useState<ModalReciboProps | null>(null);

  const [cliente, setCliente] = useState<Cliente>(clienteVazio());
  const [dadosFinanceiros, setDadosFinanceiros] = useState<any>({});
  const [isEnviando, setIsEnviando] = useState(false);

  const toastSucesso = (mensagem: string) =>
    toast.success(
      <div className="flex items-center gap-2">
        <FaCheckCircle className="text-green-500" />
        <span>{mensagem}</span>
      </div>
    );

  const toastErro = (mensagem: string) =>
    toast.error(
      <div className="flex items-center gap-2">
        <FaTimesCircle className="text-red-500" />
        <span>{mensagem}</span>
      </div>
    );

  const handleFecharModal = () => {
    setAbrirModal(false);
    setCliente(clienteVazio());
    setDadosFinanceiros({});
    limparCarrinho();
  };

  // ========= Helpers =========
  const limparMascara = (v?: string) => (v ? v.replace(/\D/g, '') : '');
  const soNum = (v: any, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  // ========= Cliente =========
  type ClientePayload = {
    id?: string;
    nome: string;
    cpf: string;
    whatsapp?: string | null;
    endereco?: string | null;
    cep?: string | null;
    estado?: string | null;
    cidade?: string | null;
    uf?: string | null;
    nascimento?: string | undefined; // ISO ou undefined
  };

  const montarPayloadCliente = (c: Cliente): ClientePayload => {
    const idValido = c.id && c.id.length === 36 ? c.id : undefined;
    const toNull = (s?: string) => (s && s.trim() !== '' ? s.trim() : null);
    const nascimentoISO =
      c.nascimento && c.nascimento.trim() !== ''
        ? new Date(c.nascimento).toISOString()
        : undefined;

    return {
      ...(idValido ? { id: idValido } : {}),
      nome: (c.nome || '').trim(),
      cpf: limparMascara(c.cpf),
      whatsapp: toNull(limparMascara(c.whatsapp)),
      endereco: toNull(c.endereco),
      cep: toNull(limparMascara(c.cep)),
      estado: toNull(c.estado),
      cidade: toNull(c.cidade),
      uf: toNull(c.uf || c.estado),
      nascimento: nascimentoISO,
    };
  };

  const validarOuCriarCliente = async (c: Cliente): Promise<Cliente | null> => {
    if (c.id && c.id.length === 36) return c;

    const cpfNum = limparMascara(c.cpf);
    if (!cpfNum) {
      toastErro('Informe um CPF válido para o cliente.');
      return null;
    }

    try {
      const { data: existente } = await api.get(`/clientes/cpf/${cpfNum}`);
      if (existente?.id) return existente as Cliente;
    } catch {
      // 404 é esperado; segue pro create
    }

    try {
      const payload = montarPayloadCliente(c);
      const { data: novo } = await api.post('/clientes', payload);
      return novo as Cliente;
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.erro;

      if (status === 409) {
        try {
          const { data: existenteAgora } = await api.get(`/clientes/cpf/${cpfNum}`);
          if (existenteAgora?.id) return existenteAgora as Cliente;
        } catch {}
        toastErro('Cliente já cadastrado, mas não foi possível recuperá-lo.');
        return null;
      }

      if (status === 400) {
        toastErro(msg || 'Dados inválidos ao salvar cliente.');
        console.error('400 /clientes payload:', error?.response?.data);
        return null;
      }

      toastErro('Erro ao salvar cliente. Verifique a conexão.');
      console.error('Erro ao salvar cliente:', error?.response?.data || error);
      return null;
    }
  };

  // ========= Venda (payload limpo para /api/vendas) =========
  type CarrinhoItemPayload = {
    id?: string;
    codigo?: string | null;
    nome: string;
    tipo?: string | null;
    quantidade: number;
    precoUnitario: number;
    subtotal: number;
  };

  type VendaPayload = {
    clienteId: string;
    data: string;
    carrinho: CarrinhoItemPayload[];
    subtotal: number;
    descontoValor: number;
    frete: number;
    acrescimo: number;
    totalFinal: number;
    forma_pagamento?: string | null;
    status_pagamento?: string | null;
    destinoDescontoId?: string | null;
    observacao?: string | null;
    filialId?: string | null; // obrigatório no backend
  };

  const montarPayloadVenda = (
    clienteFinal: Cliente,
    carrinhoAtual: any[],
    df: any
  ): VendaPayload => {
    const itens: CarrinhoItemPayload[] = carrinhoAtual.map((it: any, idx: number) => {
      const precoUnitario =
        soNum(it.precoUnitario) || soNum(it.preco) || soNum(it.valorUnitario);
      const quantidade = soNum(it.quantidade, 1);
      const subtotal = soNum(it.subtotal, precoUnitario * quantidade);

      return {
        id: typeof it.id === 'string' ? it.id : undefined,
        codigo: (it.codigo ?? null) as string | null,
        nome: String(it.nome ?? `Item ${idx + 1}`),
        tipo: (it.tipo ?? null) as string | null,
        quantidade,
        precoUnitario,
        subtotal,
      };
    });

    const subtotal =
      soNum(df.subtotal) || itens.reduce((acc, it) => acc + it.subtotal, 0);
    const descontoValor = soNum(df.descontoValor);
    const frete = soNum(df.frete);
    const acrescimo = soNum(df.acrescimo);
    const totalFinal =
      soNum(df.totalFinal) || (subtotal - descontoValor + frete + acrescimo);

    return {
      clienteId: clienteFinal.id!,
      data: new Date().toISOString(),
      carrinho: itens,
      subtotal,
      descontoValor,
      frete,
      acrescimo,
      totalFinal,
      forma_pagamento: df.forma_pagamento ?? null,
      status_pagamento: df.status_pagamento ?? null,
      destinoDescontoId: df.destinoDescontoId ?? null,
      observacao: df.observacao ?? null,
      filialId: df.filialId ?? null,
    };
  };

  // ========= Finalizar venda =========
  const handleFinalizarVenda = async () => {
    if (isEnviando) return;
    setIsEnviando(true);

    if (!cliente.nome || !carrinho.length || !dadosFinanceiros?.totalFinal) {
      toastErro('Preencha todos os dados obrigatórios antes de finalizar.');
      setIsEnviando(false);
      return;
    }

    try {
      const clienteFinal = await validarOuCriarCliente(cliente);
      if (!clienteFinal || !clienteFinal.id) {
        setIsEnviando(false);
        return;
      }

      const temQtdValida = carrinho.every((it) => soNum(it.quantidade, 0) > 0);
      if (!temQtdValida) {
        toastErro('Há item com quantidade inválida.');
        setIsEnviando(false);
        return;
      }

      // 🔹 garantir FILIAL
      const filialId =
        dadosFinanceiros?.filialId ||
        localStorage.getItem('filialId');

      if (!filialId) {
        toastErro('Escolha/defina a filial antes de finalizar.');
        setIsEnviando(false);
        return;
      }

      // monta payload e injeta filialId
      const payload = montarPayloadVenda(clienteFinal, carrinho, dadosFinanceiros);
      payload.filialId = filialId;

      console.log('🧾 Enviando venda para API (limpo):\n', JSON.stringify(payload, null, 2));

      try {
        await api.post('/vendas', payload);
      } catch (err: any) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.error('❌ Erro /vendas:', status, data);
        toastErro(data?.erro || data?.message || 'Erro ao salvar venda. Verifique os dados.');
        throw err;
      }

      toastSucesso('Venda salva com sucesso!');

      setAbrirModal(false);
      limparCarrinho();
      setCliente(clienteVazio());
      setDadosFinanceiros({});
    } catch {
      // erros já tratados
    } finally {
      setIsEnviando(false);
    }
  };

  // ========= Recibo =========
  const handleAbrirModalRecibo = () => {
    const nomeValido = (cliente.nome?.trim() || '').length > 0;
    const carrinhoValido = carrinho.length > 0;
    const totalValido = dadosFinanceiros?.totalFinal && !isNaN(dadosFinanceiros.totalFinal);

    if (!nomeValido || !carrinhoValido || !totalValido) {
      toastErro(t.erroRecibo || 'Dados incompletos para gerar recibo.');
      return;
    }

    const vendaSimulada = montarVendaSimulada(cliente, carrinho, dadosFinanceiros);

    const carrinhoConvertido: CartItem[] = vendaSimulada.carrinho.map((item, index) => {
      const precoUnitario =
        (item as any).precoUnitario ?? (item as any).preco ?? 0;
      const subtotal =
        (item as any).subtotal ?? precoUnitario * item.quantidade;

      return {
        id: (item as any).id || `fake-id-${index}`,
        codigo: (item as any).codigo || `CÓD-${index}`,
        nome: item.nome,
        tipo: (item as any).tipo || 'unitário',
        precoUnitario,
        quantidade: item.quantidade,
        subtotal,
      };
    });

    setDadosRecibo({
      venda: {
        ...vendaSimulada,
        cliente,
        carrinho: carrinhoConvertido,
      },
      onFechar: () => setMostrarModalRecibo(false),
      onGerarPDF: () => {
        const element = document.getElementById('recibo-pdf');
        if (element) {
          import('html2pdf.js').then((html2pdf) => {
            html2pdf.default().from(element).save();
          });
        }
      },
    });

    setMostrarModalRecibo(true);
  };

  return (
    <div
      className="p-6 min-h-screen flex flex-col items-center justify-center space-y-4"
      style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}
    >
      <h1 className="text-2xl font-bold" style={{ color: temaAtual.destaque }}>
        {t.novaVenda || 'Nova Venda'}
      </h1>

      <button
        onClick={() => setAbrirModal(true)}
        className="px-6 py-3 rounded font-semibold text-lg shadow transition"
        style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoBranco }}
      >
        ➕ {t.abrirFluxo || 'Iniciar Venda'}
      </button>

      {abrirModal && (
        <ModalEtapaVenda
          onFechar={handleFecharModal}
          onFinalizarVenda={handleFinalizarVenda}
          onGerarRecibo={handleAbrirModalRecibo}
          cliente={cliente}
          setCliente={setCliente}
          dadosFinanceiros={dadosFinanceiros}
          setDadosFinanceiros={setDadosFinanceiros}
          isEnviandoVenda={isEnviando}
        />
      )}

      {mostrarModalRecibo && dadosRecibo && <ModalRecibo {...dadosRecibo} />}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme={temaAtual.texto === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
};

export default NovaVendaPage;
