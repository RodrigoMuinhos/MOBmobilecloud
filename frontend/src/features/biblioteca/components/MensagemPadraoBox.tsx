import React, { useEffect, useState } from 'react';
import { FaSave, FaMagic } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { gerarMensagemDoDia } from '../../../utils/geradorMensagens';

type Props = {
  mensagem: string;
  setMensagem: (nova: string) => void;
};

const cores = ['azul', 'verde', 'vermelho', 'amarelo', 'roxo'] as const;
type Cor = typeof cores[number];

const nomesPorCor: Record<Cor, string> = {
  azul: 'Ativação',
  verde: 'Captação (10% off)',
  vermelho: 'Reativação',
  amarelo: 'Oferecimento de produto',
  roxo: 'Manutenção',
};

const corToHex: Record<Cor, string> = {
  azul: '#3b82f6',
  verde: '#22c55e',
  vermelho: '#ef4444',
  amarelo: '#eab308',
  roxo: '#a855f7',
};

const MensagemPadraoBox: React.FC<Props> = ({ mensagem, setMensagem }) => {
  const { temaAtual } = useTheme();
  const [modelo, setModelo] = useState('');
  const [mensagens, setMensagens] = useState<Record<Cor, string>>({
    azul: '',
    verde: '',
    vermelho: '',
    amarelo: '',
    roxo: '',
  });
  const [corSelecionada, setCorSelecionada] = useState<Cor | null>(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem('modelosFixosWpp');
    if (local) {
      const salvos = JSON.parse(local);
      setMensagens(salvos);
    }
  }, []);

  // Auto-selecionar cor com base na mensagem atual
  useEffect(() => {
    const corDetectada = (Object.entries(mensagens) as [Cor, string][]).find(
      ([_, msg]) => msg.trim() === mensagem.trim()
    );
    if (corDetectada) {
      setCorSelecionada(corDetectada[0]);
      setModelo(corDetectada[1]);
    } else {
      setCorSelecionada(null);
      setModelo('');
    }
  }, [mensagem, mensagens]);

  const salvar = () => {
    if (!corSelecionada) {
      alert('Selecione uma cor para salvar a mensagem.');
      return;
    }
    const atualizados = { ...mensagens, [corSelecionada]: modelo };
    setMensagens(atualizados);
    localStorage.setItem('modelosFixosWpp', JSON.stringify(atualizados));
    setMensagem(modelo);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  const gerarAutomaticamente = () => {
    const nova = gerarMensagemDoDia();
    setModelo(nova);
    setMensagem(nova);
  };

  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Quadro da Mensagem */}
      <div
        className="p-4 rounded-lg shadow"
        style={{
          background: temaAtual.cardGradient || temaAtual.card,
          color: temaAtual.texto,
          border: `1px solid ${temaAtual.contraste}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <label className="block font-semibold text-sm mb-2">
          Mensagem automática sugerida
        </label>
        <textarea
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          rows={7}
          className="w-full p-2 text-sm rounded border"
          style={{
            backgroundColor: temaAtual.input,
            color: temaAtual.texto,
          }}
          placeholder="Escreva a mensagem ou use a automática..."
        />
      </div>

      {/* Quadro de Controles */}
      <div className="flex flex-col justify-between gap-4 text-sm">
        <div>
          <label className="block font-semibold mb-2">Selecionar propósito</label>
          <div className="flex gap-3 flex-wrap">
            {cores.map((cor) => (
              <div
                key={cor}
                onClick={() => setCorSelecionada(cor)}
                className="w-6 h-6 rounded-full cursor-pointer border-2 transition-transform"
                style={{
                  backgroundColor: corToHex[cor],
                  borderColor: corSelecionada === cor ? temaAtual.destaque : 'transparent',
                  transform: corSelecionada === cor ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: corSelecionada === cor ? `0 0 0 2px ${temaAtual.textoClaro}` : 'none',
                }}
                title={nomesPorCor[cor]}
              />
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
            {cores.map((cor) => (
              <div key={cor} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: corToHex[cor] }}
                />
                <span>{nomesPorCor[cor]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-3">
          <button
            onClick={salvar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded flex items-center gap-2"
          >
            <FaSave size={14} />
            Salvar
          </button>

          <button
            onClick={gerarAutomaticamente}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded flex items-center gap-2"
          >
            <FaMagic size={14} />
            Gerar
          </button>

          {salvo && <span className="text-green-600 font-semibold">✅ Salvo!</span>}
        </div>
      </div>
    </div>
  );
};

export default MensagemPadraoBox;
