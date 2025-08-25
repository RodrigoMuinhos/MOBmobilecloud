'use client';
import React, { useEffect, useState } from 'react';
import { FaShoppingCart, FaUsers, FaBox, FaDollarSign } from 'react-icons/fa';
import ResumoCard from './ResumoCard';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { Venda, ProdutoEstoqueAPI } from '../../../types/banco';
import api from '../../../services/api';

const ResumoCards: React.FC = () => {
  const { textos, currentLang } = useLanguage();
  const { temaAtual } = useTheme();
  const idioma = textos[currentLang];

  const [vendas, setVendas] = useState<Venda[]>([]);
  const [estoque, setEstoque] = useState<ProdutoEstoqueAPI[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resVendas = await api.get('/vendas');
        const resEstoque = await api.get('/estoque');
        setVendas(resVendas.data || []);
        setEstoque(resEstoque.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    fetchData();
  }, []);

  const totalVendas = vendas.length;

  const totalClientes = new Set(
    vendas.map((v) => v.cliente?.cpf).filter((cpf) => !!cpf)
  ).size;

  const valorTotal = vendas.reduce((acc, v) => acc + (v.total || 0), 0);
  const receitaFormatada = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorTotal);

  const totalUnidades = estoque.reduce(
    (acc, item) => acc + (item.caixas || 0) * (item.unidades_por_caixa || 0),
    0
  );

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <span
        className="absolute -top-3 right-0 bg-green-600 text-white text-[10px] px-2 py-[1px] rounded-bl"
        style={{ fontWeight: 'bold' }}
      >
        DASHBOARD
      </span>

      <ResumoCard
        titulo={idioma.dashboard.clientesAtivos}
        valor={String(totalClientes)}
        icone={<FaUsers />}
      />
      <ResumoCard
        titulo={idioma.dashboard.vendasRealizadas}
        valor={String(totalVendas)}
        icone={<FaShoppingCart />}
      />
      <ResumoCard
        titulo={idioma.dashboard.itensEstoque}
        valor={String(totalUnidades)}
        icone={<FaBox />}
      />
      <ResumoCard
        titulo={idioma.dashboard.receita}
        valor={receitaFormatada}
        icone={<FaDollarSign />}
      />
    </div>
  );
};

export default ResumoCards;
