import React from 'react';
import { FaTimes, FaWhatsapp } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

interface Props {
  numero: string;
  nome?: string;
  mensagem: string;
  corStatus?: string;
  onFechar: () => void;
}

const formatarWhatsApp = (numero: string): string => {
  const n = numero.replace(/\D/g, '');
  return n.length === 11 ? `(${n.slice(0, 2)}) ${n[2]} ${n.slice(3, 7)}-${n.slice(7)}` : numero;
};

const gerarLinkWhatsApp = (numero: string, mensagem: string): string => {
  const n = numero.replace(/\D/g, '');
  const msg = encodeURIComponent(mensagem);
  return `https://wa.me/55${n}?text=${msg}`;
};

const registrarDisparo = (numero: string) => {
  const n = numero.replace(/\D/g, '');
  const agora = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Fortaleza',
  });

  const chave = 'disparosWpp';
  const registros = JSON.parse(localStorage.getItem(chave) || '[]');
  const novosRegistros = Array.isArray(registros) ? registros : [];

  novosRegistros.push({ numero: n, data: agora });
  localStorage.setItem(chave, JSON.stringify(novosRegistros));
};

const ModalConfirmarEnvio: React.FC<Props> = ({
  numero,
  nome,
  mensagem,
  corStatus = 'cinza',
  onFechar,
}) => {
  const { temaAtual } = useTheme();

  const handleDisparo = () => {
    registrarDisparo(numero);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="w-full max-w-xs rounded-xl shadow-xl flex flex-col relative overflow-hidden"
        style={{
          background: temaAtual.cardGradient || temaAtual.card,
          color: temaAtual.texto,
          height: '660px',
          border: `1px solid ${temaAtual.destaque}`,
        }}
      >
        {/* Botão de fechar */}
        <button
          onClick={onFechar}
          className="absolute top-2 right-3"
          style={{ color: temaAtual.texto }}
          title="Fechar"
        >
          <FaTimes size={18} />
        </button>

        {/* Conteúdo principal */}
        <div className="flex flex-col h-full p-4 pb-20 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3">Confirmar envio</h2>

          {nome && (
            <p className="text-sm mb-1">
              <strong>Nome:</strong> {nome}
            </p>
          )}
          <p className="text-sm mb-3">
            <strong>Número:</strong> {formatarWhatsApp(numero)}
          </p>

          <label className="block text-sm font-medium mb-1">Mensagem a ser enviada:</label>
          <textarea
            readOnly
            value={mensagem}
            className="w-full flex-1 rounded p-2 text-sm resize-none"
            style={{
              backgroundColor: temaAtual.fundoAlt,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.destaque}`,
              minHeight: '380px',
            }}
          />
        </div>

        {/* Rodapé fixo */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-3 flex justify-between items-center"
          style={{
            backgroundColor: temaAtual.card,
            borderTop: `1px solid ${temaAtual.destaque}`,
          }}
        >
          <button
            onClick={onFechar}
            className="px-4 py-2 text-sm rounded border hover:opacity-80 transition"
            style={{
              borderColor: temaAtual.destaque,
              color: temaAtual.texto,
            }}
          >
            Cancelar
          </button>

          <a
            href={gerarLinkWhatsApp(numero, mensagem)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDisparo}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition"
            style={{
              backgroundColor: '#25D366',
              color: '#fff',
            }}
          >
            <FaWhatsapp /> Enviar
          </a>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarEnvio;
