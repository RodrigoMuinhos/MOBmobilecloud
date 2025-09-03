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

  // Carrega mensagem do banco local para a cor selecionada
  useEffect(() => {
    try {
      const banco = carregarBanco();
      const mensagensSalvas = banco?.clientes?.modelosFixosWppPF || {};
      const texto = mensagensSalvas?.[corStatus] || '';
      setMensagem(texto);
      setErro(!texto.trim());
    } catch {
      setMensagem('');
      setErro(true);
    }
  }, [corStatus]);

  // Atualiza se o usuário salvar novas mensagens no box enquanto o modal estiver aberto
  useEffect(() => {
    const onModelosSalvos = (e: any) => {
      const msgs = e?.detail || {};
      const novo = msgs?.[corStatus];
      if (typeof novo === 'string') {
        setMensagem(novo);
        setErro(!novo.trim());
      }
    };
    window.addEventListener('wpp:modelosPF:salvos', onModelosSalvos);
    return () => window.removeEventListener('wpp:modelosPF:salvos', onModelosSalvos);
  }, [corStatus]);

  const enviar = () => {
    const textoEncoded = encodeURIComponent(mensagem);
    const numeroLimpo = (numero || '').replace(/\D/g, '');
    const numeroComDDI = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
    if (!numeroComDDI || !mensagem.trim()) return;
    const link = `https://wa.me/${numeroComDDI}?text=${textoEncoded}`;
    window.open(link, '_blank');
    onFechar();
  };

  const txt = {
    confirmarEnvio: (idioma?.clientes?.confirmarEnvio as string) || 'Confirmar envio',
    numero: (idioma?.clientes?.numero as string) || 'Número',
    mensagemEnvio: (idioma?.clientes?.mensagemEnvio as string) || 'Mensagem',
    cancelar: (idioma?.clientes?.cancelar as string) || 'Cancelar',
    enviar: (idioma?.clientes?.enviar as string) || 'Enviar',
    semMensagemStatus:
      ((idioma?.clientes?.semMensagemStatus as string) || 'Sem mensagem cadastrada para o status {status}.')
        .replace('{status}', corStatus),
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
          aria-label="Fechar"
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-bold text-center mb-2">{txt.confirmarEnvio}</h2>

        <p className="text-sm font-medium">{txt.numero}:</p>
        <p className="text-md font-semibold mb-3">({numero})</p>

        <p className="text-sm font-medium">{txt.mensagemEnvio}:</p>
        <textarea
          className="w-full h-48 p-3 mt-1 rounded-md text-sm"
          style={{
            background: temaAtual.input,
            color: temaAtual.texto,
            border: `1px solid ${temaAtual.contraste}`,
          }}
          value={mensagem}
          onChange={(e) => {
            const val = e.target.value;
            setMensagem(val);
            setErro(!val.trim());
          }}
        />

        {erro && (
          <p className="text-red-600 text-xs mt-2">
            ⚠ {txt.semMensagemStatus}
          </p>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={onFechar}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            {txt.cancelar}
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
            <FaWhatsapp /> {txt.enviar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarEnvioPF;
