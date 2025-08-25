import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

type Props = {
  numero: string;
  mensagem: string;
  onClose: () => void;
  onEnviar: () => void;
};

const formatarNumero = (numero: string) => {
  const n = numero.replace(/\D/g, '');
  return `(${n.slice(0, 2)}) ${n[2]} ${n.slice(3, 7)}-${n.slice(7)}`;
};

const ModalWhatsApp: React.FC<Props> = ({ numero, mensagem, onClose, onEnviar }) => {
  const { temaAtual } = useTheme();
  const [mensagemEditada, setMensagemEditada] = useState(mensagem);

  useEffect(() => {
    setMensagemEditada(mensagem);
  }, [mensagem]);

  const link = `https://wa.me/55${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensagemEditada)}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      window.open(link, '_blank');
      onEnviar();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: temaAtual.fundo,
          color: temaAtual.texto,
          padding: 24,
          borderRadius: 12,
          width: '90%',
          maxWidth: 500,
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Título e botão de fechar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Enviar mensagem</h2>
          <button onClick={onClose} className="text-xl" style={{ color: temaAtual.texto }}>
            <FaTimes />
          </button>
        </div>

        <p className="text-sm mb-2">
          <strong>Para:</strong> {formatarNumero(numero)}
        </p>

        <textarea
          rows={6}
          value={mensagemEditada}
          onChange={(e) => setMensagemEditada(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 6,
            border: `1px solid ${temaAtual.destaque}`,
            backgroundColor: temaAtual.fundoAlt,
            color: temaAtual.texto,
            resize: 'none',
            outline: 'none',
          }}
        />

        <div className="mt-4 text-right">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onEnviar}
            style={{
              backgroundColor: '#25D366',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 6,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 600,
            }}
          >
            <FaWhatsapp /> Enviar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ModalWhatsApp;
