import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';

interface Props {
  desconto: number;
  frete: number;
  acrescimo: number;
  total: number;
}

const formatarMoeda = (valor: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const ResumoFinanceiroDaVenda: React.FC<Props> = ({ desconto, frete, acrescimo, total }) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].relatorio;

  console.log('🧾 ResumoFinanceiroDaVenda valores recebidos:', {
    desconto,
    frete,
    acrescimo,
    total,
  });

  return (
    <div className="p-2 border rounded space-y-1 text-sm" style={{ borderColor: temaAtual.destaque }}>
      <div className="flex justify-between">
        <span>{t.descontoGeral}:</span> <span>{formatarMoeda(desconto)}</span>
      </div>
      <div className="flex justify-between">
        <span>{t.frete}:</span> <span>{formatarMoeda(frete)}</span>
      </div>
      <div className="flex justify-between">
        <span>{t.acrescimo}:</span> <span>{formatarMoeda(acrescimo)}</span>
      </div>
      <div className="border-t pt-1 mt-1 font-bold flex justify-between" style={{ borderColor: temaAtual.destaque }}>
        <span>{t.total}:</span> <span>{formatarMoeda(total)}</span>
      </div>
    </div>
  );
};

export default ResumoFinanceiroDaVenda;
