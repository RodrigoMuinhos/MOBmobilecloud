import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';
import { ItemCarrinhoAPI } from '../../../types/api/vendaApi.types';

const formatarMoeda = (valor: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

interface Props {
  produtos: ItemCarrinhoAPI[];
}

const TabelaProdutosDaVenda: React.FC<Props> = ({ produtos }) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang]?.relatorio || {};

  return (
    <table className="min-w-full text-xs border rounded">
      <thead style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoBranco }}>
        <tr>
          <th className="p-1 text-left">{t.produto || 'Produto'}</th>
          <th className="p-1 text-center w-16">{t.quantidade || 'Qtd'}</th>
          <th className="p-1 text-right w-24">{t.unitario || 'Unitário'}</th>
          <th className="p-1 text-right w-24">{t.subtotal || 'Subtotal'}</th>
        </tr>
      </thead>
      <tbody>
        {produtos.map((item, idx) => {
          const preco = item.precoUnitario ?? 0;
          const qtd = item.quantidade ?? 0;
          const subtotal = preco * qtd;

          return (
            <tr key={idx} className="border-t" style={{ borderColor: temaAtual.card }}>
              <td className="p-1 text-left">{item.nome}</td>
              <td className="p-1 text-center">{qtd}</td>
              <td className="p-1 text-right">{formatarMoeda(preco)}</td>
              <td className="p-1 text-right">{formatarMoeda(subtotal)}</td>
              <td className="p-1 text-left">{item.nome} {item.tipoUnidade ? `(${item.tipoUnidade})` : ''}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default TabelaProdutosDaVenda;
