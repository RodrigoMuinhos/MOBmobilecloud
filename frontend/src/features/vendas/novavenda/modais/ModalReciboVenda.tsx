'use client';

import React, { useState } from 'react';
import { FaSpinner, FaTimesCircle, FaFilePdf } from 'react-icons/fa';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { Venda } from '../../../../types/domain/venda.types';
import { Cliente } from '../../../../types/domain/cliente.types';
import { CartItem } from '../../../../types/domain/carrinho';
import { gerarReciboPDF } from '../recibo/ReciboPDF';
import { toast } from 'react-toastify';

export interface VendaComCliente extends Venda {
  cliente: Cliente;
  carrinho: CartItem[];
}

export interface ModalReciboProps {
  venda: VendaComCliente;
  onFechar: () => void;
  onGerarPDF: () => void;
}

function gerarLinkWhatsApp(nome: string, numero: string, valor: number, data: string) {
  const numeroLimpo = numero.replace(/\D/g, '');
  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);

  const dataFormatada = new Date(data).toLocaleDateString('pt-BR');

  const mensagem = `Olá ${nome}, obrigado pela sua compra!\n\n` +
                   `💰 Valor total: ${valorFormatado}\n` +
                   `🗓️ Data da venda: ${dataFormatada}\n\n` +
                   `Estamos à disposição para o que precisar!\n\nEquipe MobSupply 💙`;

  return `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
}

const ModalRecibo: React.FC<ModalReciboProps> = ({ venda, onFechar }) => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.vendas;
  const [gerandoPDF, setGerandoPDF] = useState(false);

  const dadosIncompletos =
    !venda || !venda.clienteId || !venda.clienteNome || !venda.cliente || !venda.carrinho?.length || !venda.totalFinal;

  const formatarData = (data: string) => new Date(data).toLocaleDateString('pt-BR');
  const formatarCPF = (cpf: string) => cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50" style={{ backdropFilter: 'blur(6px)' }}>
      <div className="w-[92%] md:w-[85%] lg:w-[65%] max-h-[90vh] bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 rounded-xl shadow-xl p-6 overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-white">
            {t.recibo?.titulo || 'Recibo de Venda'}
          </h2>
          <button onClick={onFechar} className="text-red-600 hover:text-red-800 text-2xl font-bold" title="Fechar">
            ×
          </button>
        </div>

        {/* Conteúdo */}
        <div className="bg-white text-black dark:bg-zinc-800 dark:text-white rounded-lg p-4 border shadow">
          {dadosIncompletos ? (
            <div className="text-red-600 text-center flex items-center justify-center gap-2 p-6">
              <FaTimesCircle className="text-xl" />
              {t.recibo?.erro || 'Dados incompletos para gerar o recibo.'}
            </div>
          ) : (
            <div className="space-y-6 text-sm">
              {/* Cliente */}
              <div className="space-y-1">
                <div><strong>Cliente:</strong> {venda.cliente.nome}</div>
                {venda.cpf && <div><strong>CPF:</strong> {formatarCPF(venda.cpf)}</div>}
                {venda.cliente.whatsapp && <div><strong>WhatsApp:</strong> {venda.cliente.whatsapp}</div>}
                {venda.cliente.endereco && <div><strong>Endereço:</strong> {venda.cliente.endereco}</div>}
                {venda.cliente.cep && <div><strong>CEP:</strong> {venda.cliente.cep}</div>}
                {venda.cliente.nascimento && <div><strong>Nascimento:</strong> {venda.cliente.nascimento}</div>}
                <div><strong>Data da Venda:</strong> {formatarData(venda.data)}</div>
              </div>

              {/* Produtos */}
              <table className="w-full text-sm border border-zinc-300 dark:border-zinc-700">
                <thead className="bg-zinc-100 dark:bg-zinc-700">
                  <tr>
                    <th className="p-2 border">Produto</th>
                    <th className="p-2 border">Qtd</th>
                    <th className="p-2 border">Preço</th>
                    <th className="p-2 border">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venda.carrinho.map((item, idx) => (
                    <tr key={idx} className="text-center">
                      <td className="p-2 border">
                        {item.nome}{item.tipo ? ` (${item.tipo})` : ''}
                      </td>
                      <td className="p-2 border">{item.quantidade}</td>
                      <td className="p-2 border">R$ {item.precoUnitario.toFixed(2)}</td>
                      <td className="p-2 border">R$ {item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totais */}
              <div className="text-right text-sm space-y-1">
                <div>Subtotal: <strong>R$ {venda.subtotal.toFixed(2)}</strong></div>
                {venda.descontoValor > 0 && (
                  <div>
                    Desconto: <strong>- R$ {venda.descontoValor.toFixed(2)}</strong>
                    {venda.descontoPercentual > 0 && (
                      <span className="ml-2 text-xs italic">
                        ({venda.descontoPercentual}% Cupom)
                      </span>
                    )}
                  </div>
                )}
                {venda.frete > 0 && <div>Frete: <strong>+ R$ {venda.frete.toFixed(2)}</strong></div>}
                {venda.forma_pagamento && <div>Forma de Pagamento: <strong>{venda.forma_pagamento}</strong></div>}
              </div>

              {/* Total Final */}
              <div className="text-2xl font-bold text-right mt-2">
                Total Final: R$ {venda.totalFinal.toFixed(2)}
              </div>

              {/* Mensagem final */}
              <div className="text-center text-sm italic text-zinc-600 dark:text-zinc-300 mt-4 space-y-1">
                <div>
                  Cada caixa com {venda.carrinho[0]?.tipo} saiu por{' '}
                  <strong>R$ {venda.carrinho[0]?.precoUnitario.toFixed(2)}</strong>
                </div>
                {venda.descontoValor > 0 && (
                  <div>
                    Você economizou <strong>R$ {venda.descontoValor.toFixed(2)}</strong> com esta compra.
                  </div>
                )}
                <div>Obrigado por comprar com a gente! 💙</div>
              </div>
            </div>
          )}
        </div>

        {/* Botões */}
        {!dadosIncompletos && (
          <div className="flex justify-end mt-6 gap-2">
<button
  onClick={async () => {
    try {
      setGerandoPDF(true);
      console.log('🧾 Gerando PDF para:', venda);
      await gerarReciboPDF(venda);
      toast.success('PDF gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar PDF');
      console.error(err);
    } finally {
      setGerandoPDF(false);
    }
  }}
  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow flex items-center gap-2"
  title="Gerar PDF"
  disabled={gerandoPDF}
>
  {gerandoPDF ? (
    <>
      <FaSpinner className="animate-spin" />
      <span className="ml-2">Gerando...</span>
    </>
  ) : (
    <FaFilePdf />
  )}
</button>


            {venda.cliente.whatsapp && (
              <a
                href={gerarLinkWhatsApp(
                  venda.cliente.nome,
                  venda.cliente.whatsapp,
                  venda.totalFinal,
                  venda.data
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow flex items-center gap-2"
                title="Enviar por WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M20.52 3.48a12.07 12.07 0 0 0-17.06 0 12.07 12.07 0 0 0 0 17.06l-1.39 4.06 4.06-1.39a12.07 12.07 0 0 0 17.06-17.06zm-8.01 16.25a10.05 10.05 0 0 1-5.07-1.39l-.36-.22-3.01.99.99-3.01-.22-.36a10.05 10.05 0 1 1 7.67 3.99zm5.23-7.1c-.29-.14-1.72-.84-1.99-.93-.27-.09-.47-.14-.66.14-.19.29-.76.93-.93 1.12-.17.19-.34.21-.63.07-.29-.14-1.23-.45-2.34-1.43-.86-.76-1.44-1.7-1.61-1.99-.17-.29-.02-.45.13-.59.14-.14.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.14-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.51-.17-.01-.36-.01-.55-.01-.19 0-.48.07-.73.36s-.95.93-.95 2.27c0 1.33.97 2.61 1.11 2.79.14.19 1.91 2.91 4.63 4.08.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.72-.7 1.96-1.38.24-.67.24-1.24.17-1.37-.07-.13-.26-.2-.55-.34z" />
                </svg>
                
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalRecibo;
