'use client';
import React, { useEffect, useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../../../context/LanguageContext';
import { useTheme } from '../../../../context/ThemeContext';
import { carregarBanco } from '../../../../data/bancoLocal';

interface Props {
  numero: string;
  corStatus: 'cinza' | 'azul' | 'amarelo' | 'verde' | 'roxo';
  onFechar: () => void;
}

const coresFundo: Record<Props['corStatus'], string> = {
  cinza: '#f3f4f6',
  azul: '#e0f2fe',
  amarelo: '#fef9c3',
  verde: '#dcfce7',
  roxo: '#ede9fe',
};

const ModalConfirmarEnvioPF: React.FC<Props> = ({ numero, corStatus, onFechar }) => {
  const { textos, currentLang } = useLanguage();
  const { temaAtual } = useTheme();
  const idioma = textos[currentLang];

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  useEffect(() => {
    try {
      const banco = carregarBanco();
      const mensagensSalvas = banco.clientes?.modelosFixosWppPF || {};
      const texto = mensagensSalvas[corStatus];
      if (!texto) {
        setErro(true);
        setMensagem('');
      } else {
        setMensagem(texto);
        setErro(false);
      }
    } catch {
      setErro(true);
      setMensagem('');
    }
  }, [corStatus]);

  const enviar = () => {
    const textoEncoded = encodeURIComponent(mensagem);
    const numeroLimpo = numero.replace(/\D/g, '');
    const link = `https://wa.me/55${numeroLimpo}?text=${textoEncoded}`;
    window.open(link, '_blank');
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div
        className="w-full max-w-sm md:max-w-md p-6 rounded-xl shadow-xl relative"
        style={{
          backgroundColor: coresFundo[corStatus],
          border: `3px solid ${temaAtual.destaque}`,
          color: temaAtual.texto,
        }}
      >
        <button
          onClick={onFechar}
          className="absolute top-3 right-3 text-xl"
          style={{ color: temaAtual.texto }}
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-bold text-center mb-2">{idioma.clientes.confirmarEnvio}</h2>

        <p className="text-sm font-medium">{idioma.clientes.numero}:</p>
        <p className="text-md font-semibold mb-3">({numero})</p>

        <p className="text-sm font-medium">{idioma.clientes.mensagemEnvio}:</p>
        <textarea
          className="w-full h-48 p-3 mt-1 border border-gray-300 rounded-md text-sm bg-white text-black"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
        />

        {erro && (
          <p className="text-red-600 text-xs mt-2">
            ⚠ {idioma.clientes.semMensagemStatus.replace('{status}', corStatus)}
          </p>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={onFechar}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            {idioma.clientes.cancelar}
          </button>
          <button
            onClick={enviar}
            disabled={!mensagem.trim()}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              mensagem.trim()
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            <FaWhatsapp /> {idioma.clientes.enviar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarEnvioPF;
