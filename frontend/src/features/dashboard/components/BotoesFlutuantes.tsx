'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaUser,
  FaBoxOpen,
  FaDollarSign,
  FaWhatsapp,
} from 'react-icons/fa';

import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

const BotoesFlutuantes: React.FC = () => {
  const navigate = useNavigate();
  const { temaAtual } = useTheme();
  const { currentLang, textos } = useLanguage();
  const idioma = textos[currentLang];

  const [estoqueBaixo, setEstoqueBaixo] = useState(0);

  useEffect(() => {
    const buscarEstoqueCritico = async () => {
      try {
        const response = await api.get('/estoque/critico');
        setEstoqueBaixo(response.data.total || 0);
      } catch (error) {
        console.error('Erro ao buscar estoque crítico:', error);
      }
    };

    buscarEstoqueCritico();
  }, []);

  const estiloBotao = (cor: string, texto: string) => ({
    backgroundColor: cor,
    color: texto,
    boxShadow: `0 0 10px ${cor}66`,
  });

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50 animate-fade-in">
      {/* Nova Venda */}
      <button
        onClick={() => navigate('/vendas/nova')}
        className="p-3 rounded-full hover:scale-110 transition-all duration-200"
        style={estiloBotao(temaAtual.destaque, temaAtual.textoBranco)}
        title={idioma.atalhos.novaVenda}
      >
        <FaPlus />
      </button>

      {/* Estoque Atual */}
      <div className="relative">
        <button
          onClick={() => navigate('/estoque/EstoqueAtual')}
          className="p-3 rounded-full hover:scale-110 transition-all duration-200 relative"
          style={estiloBotao(temaAtual.contraste, temaAtual.textoClaro)}
          title={idioma.atalhos.estoqueAtual}
        >
          <FaBoxOpen />
          {estoqueBaixo > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {estoqueBaixo}
            </span>
          )}
        </button>
      </div>

      {/* Lista de Clientes */}
      <button
        onClick={() => navigate('/clientes/lista')}
        className="p-3 rounded-full hover:scale-110 transition-all duration-200"
        style={estiloBotao(temaAtual.card, temaAtual.texto)}
        title={idioma.atalhos.listaClientes}
      >
        <FaUser />
      </button>

      {/* Relatório de Vendas */}
      <button
        onClick={() => navigate('/financeiro/vendas')}
        className="p-3 rounded-full hover:scale-110 transition-all duration-200"
        style={estiloBotao(temaAtual.fundoAlt, temaAtual.texto)}
        title={idioma.atalhos.relatorioVendas}
      >
        <FaDollarSign />
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => window.open('https://wa.me/5585997254989', '_blank')}
        className="p-3 rounded-full hover:scale-110 transition-all duration-200"
        style={estiloBotao(temaAtual.destaque, temaAtual.textoBranco)}
        title={idioma.atalhos.faleWhatsapp}
      >
        <FaWhatsapp className="text-xl" />
      </button>
    </div>
  );
};

export default BotoesFlutuantes;
