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
import { montarVendaFinal } from '../../../utils/venda/montarVendaFinal';
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

  const handleFinalizarVenda = async () => {
    if (isEnviando) return;
    setIsEnviando(true);

    if (!cliente.nome || !carrinho.length || !dadosFinanceiros?.totalFinal) {
      toastErro('Preencha todos os dados obrigatórios antes de finalizar.');
      setIsEnviando(false);
      return;
    }

    const limparMascara = (v: string) => v?.replace(/\D/g, '') || '';

    const validarOuCriarCliente = async (cliente: Cliente): Promise<Cliente | null> => {
      if (cliente.id) return cliente;

      try {
        const { data: clienteSalvo } = await api.post('/clientes', {
          ...cliente,
          cpf: limparMascara(cliente.cpf),
          whatsapp: limparMascara(cliente.whatsapp),
          cep: limparMascara(cliente.cep),
        });
        return clienteSalvo;
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        toastErro('Erro ao salvar cliente.');
        return null;
      }
    };

    try {
      const clienteFinal = await validarOuCriarCliente(cliente);
      if (!clienteFinal || !clienteFinal.id) {
        setIsEnviando(false);
        return;
      }

      const venda = montarVendaFinal(clienteFinal, carrinho, dadosFinanceiros);
      console.log('🧾 Enviando venda para API:', venda);
      await api.post('/vendas', venda);

      toastSucesso('Venda salva com sucesso!');

      // ✅ Apenas fecha e reseta
      setAbrirModal(false);
      limparCarrinho();
      setCliente(clienteVazio());
      setDadosFinanceiros({});
    } catch (error: any) {
      console.error('Erro ao salvar venda via API:', error);
      toastErro('Erro ao salvar venda. Verifique os dados e tente novamente.');
    } finally {
      setIsEnviando(false);
    }
  };

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
    (item as any).precoUnitario ??
    (item as any).preco ??
    0;

  const subtotal =
    (item as any).subtotal ??
    precoUnitario * item.quantidade;

  return {
    id: (item as any).id || `fake-id-${index}`,
    codigo: (item as any).codigo || `CÓD-${index}`,
    nome: item.nome,
    tipo: (item as any).tipo || 'unitário',
    precoUnitario,
    quantidade: item.quantidade,
    subtotal
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
