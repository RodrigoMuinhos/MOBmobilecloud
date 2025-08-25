import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();

  return (
    <footer
      className="w-full text-center py-4 text-sm border-t"
      style={{
        backgroundColor: temaAtual.fundoAlt,
        color: temaAtual.texto,
        borderColor: temaAtual.destaque,
      }}
    >
      {language.footer?.rodape || '© 2025 Saúde + Móvel. Todos os direitos reservados.'}
    </footer>
  );
};

export default Footer;
