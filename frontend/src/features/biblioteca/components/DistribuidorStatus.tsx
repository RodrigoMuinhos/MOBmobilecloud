import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

type Props = {
  totalClientes: number;
  onDistribuir: (mapaDistribuido: Record<string, string>) => void;
  clientes: { cnpj: string | number }[];
};

const coresDisponiveis = ['azul', 'verde', 'vermelho', 'amarelo', 'roxo'];

const DistribuidorStatus: React.FC<Props> = ({ totalClientes, onDistribuir, clientes }) => {
  const { temaAtual } = useTheme();

  const gerarStatus = () => {
    if (totalClientes === 0) return;

    const porCor = Math.floor(totalClientes / coresDisponiveis.length);
    const sobra = totalClientes % coresDisponiveis.length;

    const distribuicao: string[] = [];

    coresDisponiveis.forEach(cor => {
      for (let i = 0; i < porCor; i++) {
        distribuicao.push(cor);
      }
    });

    for (let i = 0; i < sobra; i++) {
      distribuicao.push(coresDisponiveis[i]);
    }

    const embaralhado = distribuicao.sort(() => Math.random() - 0.5);

    const novoMapa: Record<string, string> = {};
    clientes.forEach((cliente, i) => {
      const cnpjKey = String(cliente.cnpj);
      novoMapa[cnpjKey] = embaralhado[i];
    });

    onDistribuir(novoMapa);
  };

  const desmarcarTodos = () => {
    const novoMapa: Record<string, string> = {};
    clientes.forEach((cliente) => {
      novoMapa[String(cliente.cnpj)] = 'cinza';
    });
    onDistribuir(novoMapa);
  };

  return (
    <div
      className="rounded-lg shadow p-4 mt-4 w-full flex flex-col md:flex-row gap-4 items-center justify-center"
      style={{
        background: temaAtual.cardGradient || temaAtual.card,
        border: `1px solid ${temaAtual.destaque}`,
        color: temaAtual.texto,
        backdropFilter: 'blur(8px)',
      }}
    >
      <button
        onClick={gerarStatus}
        className="px-4 py-2 rounded font-medium transition-all"
        style={{
          backgroundColor: temaAtual.destaque,
          color: temaAtual.textoClaro,
        }}
      >
        🎯 Gerar Status
      </button>

      <button
        onClick={desmarcarTodos}
        className="px-4 py-2 rounded font-medium border"
        style={{
          backgroundColor: temaAtual.input,
          color: temaAtual.texto,
          borderColor: temaAtual.texto,
        }}
      >
        ❌ Desmarcar Todos
      </button>
    </div>
  );
};

export default DistribuidorStatus;
