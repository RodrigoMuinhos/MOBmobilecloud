import React from 'react';
import {
  FaTrash,
  FaPrint,
  FaPlus,
} from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';

interface Props {
  onLimpar: () => void;
  onExportarPDF: () => void;
  onAdicionarProduto: () => void;
  onAtualizar: () => void;
}

const BotaoEstoqueActions: React.FC<Props> = ({
  onLimpar,
  onExportarPDF,
  onAdicionarProduto,
}) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].estoque;

  const iconStyle = 'p-2 rounded-full shadow';

  return (
    <div className="flex gap-3 mb-6">
      <button
        onClick={onLimpar}
        title={t.confirmarLimpar}
        className={iconStyle}
        style={{ backgroundColor: temaAtual.destaque, color: temaAtual.fundo }}
      >
        <FaTrash size={18} />
      </button>

      <button
        onClick={onExportarPDF}
        title={t.exportarPDF}
        className={iconStyle}
        style={{ backgroundColor: temaAtual.destaque, color: temaAtual.fundo }}
      >
        <FaPrint size={18} />
      </button>

      <button
        onClick={onAdicionarProduto}
        title={t.adicionarProduto || 'Adicionar Produto'}
        className={iconStyle}
        style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}
      >
        <FaPlus size={18} />
      </button>
    </div>
  );
};

export default BotaoEstoqueActions;
