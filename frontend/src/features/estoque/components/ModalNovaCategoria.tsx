// src/features/estoque/components/ModalNovaCategoria.tsx
'use client';
import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';

interface Props {
  onConfirmar: (categoria: string, tipo: string) => void;
  onFechar: () => void;
}

const ModalNovaCategoria: React.FC<Props> = ({ onConfirmar, onFechar }) => {
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('');
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].estoque;

  const handleConfirmar = () => {
    const categoriaFinal = categoria.trim();
    const tipoFinal = tipo.trim();

    if (!categoriaFinal || !tipoFinal) {
      alert(t.alertPreenchaCampos || 'Preencha os dois campos para continuar.');
      return;
    }

    onConfirmar(categoriaFinal, tipoFinal); // ✅ deixa o POST para o pai
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="rounded-xl shadow-lg p-6 w-[320px]"
           style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}>
        <h2 className="text-xl font-semibold mb-4 text-center">
          {t.novaCategoria || 'Nova Categoria'}
        </h2>

        <input
          type="text"
          placeholder={t.digiteCategoria || 'Digite a categoria (ex: VX)'}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full mb-3 p-2 rounded border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-900 text-black dark:text-white"
        />

        <input
          type="text"
          placeholder={t.digiteTipo || 'Digite o tipo (ex: RL)'}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full mb-4 p-2 rounded border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-900 text-black dark:text-white"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onFechar} className="px-4 py-1 rounded bg-gray-600 text-white hover:bg-gray-700">
            {t.cancelar || 'Cancelar'}
          </button>
          <button onClick={handleConfirmar} className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700">
            {t.confirmar || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalNovaCategoria;
