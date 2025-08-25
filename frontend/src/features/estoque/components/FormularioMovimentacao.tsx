'use client';
import React, { useState } from 'react';
import { ItemEstoque } from '../../../types/banco';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

interface Props {
  itens: ItemEstoque[];
  tipo: 'entrada' | 'saida';
  onFinalizado?: () => void;
}

const FormularioMovimentacao: React.FC<Props> = ({ itens, tipo, onFinalizado }) => {
  const [codigoSelecionado, setCodigoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [carregando, setCarregando] = useState(false);

  const { temaAtual } = useTheme();
  const { currentLang, textos } = useLanguage();
  const t = textos[currentLang].estoque;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoSelecionado || quantidade <= 0) return;

    try {
      setCarregando(true);

      await api.post('/estoque/movimentar', {
        codigo: codigoSelecionado,
        tipo,
        quantidade,
      });

      alert(t.movimentacaoSucesso || 'Movimentação registrada com sucesso!');
      setQuantidade(0);
      setCodigoSelecionado('');
      onFinalizado?.();
    } catch (error) {
      console.error('Erro ao movimentar estoque:', error);
      alert(t.erroMovimentacao || 'Erro ao movimentar estoque.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded p-4 max-w-lg space-y-4 border"
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
        borderColor: temaAtual.texto,
      }}
    >
      <h2 className="text-lg font-bold" style={{ color: temaAtual.texto }}>
        {tipo === 'entrada' ? t.registrarEntrada : t.registrarSaida}
      </h2>

      <select
        value={codigoSelecionado}
        onChange={(e) => setCodigoSelecionado(e.target.value)}
        className="border rounded px-3 py-2 w-full"
        style={{
          backgroundColor: temaAtual.input,
          color: temaAtual.texto,
          borderColor: temaAtual.texto,
        }}
      >
        <option value="">{t.selecioneItem}</option>
        {itens.map((item) => (
          <option key={item.codigo} value={item.codigo}>
            {item.nome} — {item.quantidade_em_estoque} {t.unidades}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={quantidade}
        onChange={(e) => setQuantidade(Number(e.target.value))}
        placeholder={t.quantidade}
        className="border rounded px-3 py-2 w-full"
        style={{
          backgroundColor: temaAtual.input,
          color: temaAtual.texto,
          borderColor: temaAtual.texto,
        }}
      />

      <button
        type="submit"
        disabled={carregando}
        className="px-4 py-2 rounded disabled:opacity-50"
        style={{ backgroundColor: temaAtual.botao, color: temaAtual.texto }}
      >
        {carregando ? t.enviando || 'Enviando...' : t.confirmar}
      </button>
    </form>
  );
};

export default FormularioMovimentacao;
