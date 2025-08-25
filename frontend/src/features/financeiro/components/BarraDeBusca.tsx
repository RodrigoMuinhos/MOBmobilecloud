'use client';

import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';

type Props = {
  buscaNome: string;
  setBuscaNome: (valor: string) => void;
  buscaCpf: string;
  setBuscaCpf: (valor: string) => void;
  buscaUf: string;
  setBuscaUf: (valor: string) => void;
};

const ufs = [
  '', 'CE','PA', 'PE', ];

const BarraDeBusca: React.FC<Props> = ({
  buscaNome,
  setBuscaNome,
  buscaCpf,
  setBuscaCpf,
  buscaUf,
  setBuscaUf,
}) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].relatorio;

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <input
        type="text"
        value={buscaNome}
        onChange={(e) => setBuscaNome(e.target.value)}
        placeholder={t.buscarPorNome}
        className="p-2 rounded border w-full md:w-2/5"
        style={{ backgroundColor: temaAtual.input, color: temaAtual.texto }}
      />

      <input
        type="text"
        value={buscaCpf}
        onChange={(e) => setBuscaCpf(e.target.value)}
        placeholder={t.buscarPorCpf}
        className="p-2 rounded border w-full md:w-2/5"
        style={{ backgroundColor: temaAtual.input, color: temaAtual.texto }}
      />

      <select
        value={buscaUf}
        onChange={(e) => setBuscaUf(e.target.value)}
        className="p-2 rounded border w-full md:w-1/5"
        style={{ backgroundColor: temaAtual.input, color: temaAtual.texto }}
      >
        <option value="">{t.buscarPorUf ?? 'UF'}</option>
        {ufs.map((uf) => (
          uf && <option key={uf} value={uf}>{uf}</option>
        ))}
      </select>
    </div>
  );
};

export default BarraDeBusca;
