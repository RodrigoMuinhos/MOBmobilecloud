'use client';
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';
import { ProdutoEstoqueAPI } from '../../../types/banco';

interface Props {
  estoque: ProdutoEstoqueAPI[];
}

const ResumoPorTipoMarca: React.FC<Props> = ({ estoque }) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].estoque;

  const agrupado = estoque.reduce((acc, item) => {
    const marca = (item.marca || 'sem marca').toLowerCase();
    const tipo = item.tipo || 'modelo padrão';
    const caixas = Number(item.caixas) || 0;
    const unidades = Number(item.unidades_por_caixa) || 1;
    const preco = Number(item.preco_caixa) || 0;

    acc[marca] = acc[marca] || {};
    acc[marca][tipo] = acc[marca][tipo] || { caixas: 0, unidades: 0, valor: 0 };

    acc[marca][tipo].caixas += caixas;
    acc[marca][tipo].unidades += caixas * unidades;
    acc[marca][tipo].valor += caixas * preco;

    return acc;
  }, {} as Record<string, Record<string, { caixas: number; unidades: number; valor: number }>>);

  const formatar = (n: number) => `R$ ${n.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(agrupado).map(([marca, modelos]) => {
        const totais = Object.values(modelos).reduce(
          (acc, m) => {
            acc.caixas += m.caixas;
            acc.unidades += m.unidades;
            acc.valor += m.valor;
            return acc;
          },
          { caixas: 0, unidades: 0, valor: 0 }
        );

        return (
          <div
            key={marca}
            className="rounded-lg shadow-md p-4 border"
            style={{
              backgroundColor: temaAtual.card,
              borderColor: temaAtual.destaque,
              color: temaAtual.texto,
            }}
          >
            <h3 className="text-lg font-semibold mb-2">{marca.toUpperCase()}</h3>

            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-1">{t.tipo}</th>
                  <th className="text-center p-1">{t.caixas}</th>
                  <th className="text-right p-1">{t.valorTotal}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(modelos).map(([tipo, dados]) => (
                  <tr key={`${marca}-${tipo}`}>
                    <td className="p-1">{tipo}</td>
                    <td className="p-1 text-center">
                      {dados.caixas}
                      <span className="text-xs opacity-70"> ({dados.unidades} unid)</span>
                    </td>
                    <td className="p-1 text-right">{formatar(dados.valor)}</td>
                  </tr>
                ))}
                <tr className="font-semibold border-t">
                  <td className="p-1">{t.total}</td>
                  <td className="p-1 text-center">
                    {totais.caixas}
                    <span className="text-xs opacity-70"> ({totais.unidades} unid)</span>
                  </td>
                  <td className="p-1 text-right">{formatar(totais.valor)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default ResumoPorTipoMarca;
