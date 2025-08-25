'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Cliente } from '../../../../types/domain/cliente.types';
import { Venda } from '../../../../types/domain/venda.types';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';

interface Props {
  cliente: Cliente;
  vendasDoCliente: Venda[];
  onFechar: () => void;
  onAtualizarNome: (novoNome: string) => void;
}

const ModalAnaliseCliente: React.FC<Props> = ({ cliente, vendasDoCliente, onFechar }) => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const idioma = textos[currentLang];

  // Novo: contar produtos via carrinho
  const produtosContagem: Record<string, number> = {};
  vendasDoCliente.forEach((venda) => {
    venda.carrinho?.forEach((item) => {
      const nome = item.nome || 'Produto';
      produtosContagem[nome] = (produtosContagem[nome] || 0) + item.quantidade;
    });
  });

  const topProdutos = Object.entries(produtosContagem)
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);

  const totalGasto = vendasDoCliente.reduce((soma, v) => soma + (v.totalFinal || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div
        className="w-full max-w-2xl p-6 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]"
        style={{ background: temaAtual.card, color: temaAtual.texto }}
      >
        <h2 className="text-xl font-bold mb-4">
          {idioma.clientes.analiseDe} {cliente.nome}
        </h2>

        <p className="mb-1">
          <strong>{idioma.clientes.cpf}:</strong> {cliente.cpf || idioma.geral?.naoInformado}
        </p>
        <p className="mb-1">
          <strong>{idioma.clientes.nascimento}:</strong>{' '}
          {cliente.nascimento || idioma.geral?.naoInformado}
        </p>
        <p className="mb-1">
          <strong>{idioma.clientes.numeroCompras}:</strong> {vendasDoCliente.length}
        </p>
        <p className="mb-4">
          <strong>{idioma.clientes.totalGasto}:</strong> R$ {totalGasto.toFixed(2)}
        </p>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">{idioma.clientes.topProdutos}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProdutos}>
              <XAxis dataKey="nome" stroke={temaAtual.texto} />
              <YAxis stroke={temaAtual.texto} />
              <Tooltip
                contentStyle={{
                  backgroundColor: temaAtual.card,
                  borderColor: temaAtual.destaque,
                  color: temaAtual.texto,
                }}
              />
              <Bar dataKey="quantidade" fill={temaAtual.destaque} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 text-right">
          <button
            className="px-4 py-2 rounded hover:opacity-90"
            style={{ background: temaAtual.destaque, color: temaAtual.card }}
            onClick={onFechar}
          >
            {idioma.geral?.fechar || 'Fechar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAnaliseCliente;
