'use client';
import React, { useEffect, useState } from 'react';
import { BsCircleFill } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { carregarBanco, salvarBanco } from '../../../../data/bancoLocal';

const cores = ['cinza', 'azul', 'amarelo', 'verde', 'roxo'] as const;
type Cor = typeof cores[number];

const corToHex: Record<Cor, string> = {
  cinza: '#9ca3af',
  azul: '#3b82f6',
  amarelo: '#eab308',
  verde: '#22c55e',
  roxo: '#a855f7',
};

const MensagemPadraoBoxPF: React.FC = () => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const idioma = textos[currentLang];

  const [corSelecionada, setCorSelecionada] = useState<Cor>('cinza');
  const [mensagens, setMensagens] = useState<Record<Cor, string>>({
    cinza: '',
    azul: '',
    amarelo: '',
    verde: '',
    roxo: '',
  });

  useEffect(() => {
    const banco = carregarBanco();
    const salvas = banco.clientes?.modelosFixosWppPF || {};
    const atualizadas: Record<Cor, string> = { ...mensagens };
    cores.forEach((cor) => {
      if (salvas[cor]) atualizadas[cor] = salvas[cor];
    });
    setMensagens(atualizadas);
  }, []);

  const salvar = () => {
    const banco = carregarBanco();
    banco.clientes = {
      ...banco.clientes,
      modelosFixosWppPF: mensagens,
    };
    salvarBanco(banco);
    alert(idioma.estoque.salvoSucesso || '✅ Mensagem salva com sucesso!');
  };

  return (
    <div
      className="p-4 rounded-xl shadow-lg"
      style={{
        background: temaAtual.card,
        color: temaAtual.texto,
        border: `1px solid ${temaAtual.contraste}`,
      }}
    >
      <h3 className="font-semibold mb-3 text-lg">
        {idioma.mensagens.titulo}
      </h3>

      {/* Seletor de status (círculos coloridos) */}
      <div className="flex items-center gap-4 mb-4">
        {cores.map((cor) => (
          <div key={cor} className="flex flex-col items-center gap-1">
            <BsCircleFill
              size={22}
              className={`cursor-pointer transition-transform ${
                corSelecionada === cor ? 'scale-125' : ''
              }`}
              style={{ color: corToHex[cor] }}
              onClick={() => setCorSelecionada(cor)}
              title={idioma.mensagens[cor] || cor}
            />
            <span className="text-xs" style={{ color: temaAtual.texto }}>{cor.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {/* Área de edição da mensagem */}
      <textarea
        value={mensagens[corSelecionada]}
        onChange={(e) =>
          setMensagens({ ...mensagens, [corSelecionada]: e.target.value })
        }
        className="w-full p-3 rounded text-sm mb-4"
        style={{
          background: temaAtual.input,
          color: temaAtual.texto,
          border: `1px solid ${temaAtual.contraste}`,
        }}
        placeholder={idioma.mensagens.placeholder}
        rows={5}
      />

      {/* Botão de salvar */}
      <button
        onClick={salvar}
        className="px-4 py-2 rounded flex items-center gap-2 transition-all"
        style={{
          background: temaAtual.destaque,
          color: temaAtual.textoClaro,
        }}
      >
        <FaSave />
        {idioma.mensagens.botaoSalvar}
      </button>
    </div>
  );
};

export default MensagemPadraoBoxPF;
