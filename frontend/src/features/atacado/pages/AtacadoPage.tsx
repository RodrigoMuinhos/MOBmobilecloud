'use client';
import React, { useEffect, useState } from 'react';
import GeradorDeAtacado from '../components/GeradorDeAtacado';
import CardSimulacaoAtacado from '../components/CardSimulacaoAtacado';
import { useTheme } from '../../../context/ThemeContext';

type Simulacao = {
  id: string;
  nome: string;
  studio: string;
  cpfCnpj: string;
  endereco: string;
  tipo: 'Consignado' | 'Pré-venda';
  valorInvestido: number;
  data: string;
};

const AtacadoPage: React.FC = () => {
  const { temaAtual } = useTheme();
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [simulacaoSelecionada, setSimulacaoSelecionada] = useState<Simulacao | null>(null);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    const salvas = localStorage.getItem('SIMULACOES_ATACADO');
    if (salvas) {
      setSimulacoes(JSON.parse(salvas));
    }
  }, []);

  // Salvar no localStorage sempre que mudar
  const salvarSimulacoes = (novas: Simulacao[]) => {
    setSimulacoes(novas);
    localStorage.setItem('SIMULACOES_ATACADO', JSON.stringify(novas));
  };

  // Função chamada ao salvar uma nova simulação
  const handleSalvarNova = (simulacao: Simulacao) => {
    const novas = [...simulacoes, simulacao];
    salvarSimulacoes(novas);
  };

  // Remover simulação
  const handleRemover = (id: string) => {
    const novas = simulacoes.filter((s) => s.id !== id);
    salvarSimulacoes(novas);
  };

  // Atualizar simulação (edição)
  const handleEditar = (simulacaoAtualizada: Simulacao) => {
    const novas = simulacoes.map((s) => (s.id === simulacaoAtualizada.id ? simulacaoAtualizada : s));
    salvarSimulacoes(novas);
  };

  return (
    <div className="p-6 space-y-6" style={{ background: temaAtual.fundo }}>
      <h1 className="text-2xl font-bold" style={{ color: temaAtual.texto }}>
        Painel de Atacado
      </h1>

      <section
        className="rounded-lg shadow p-4"
        style={{ background: temaAtual.card, color: temaAtual.texto }}
      >
        <h2 className="text-lg font-semibold mb-2">Simulador</h2>

        <GeradorDeAtacado
          simulacaoSelecionada={simulacaoSelecionada}
          onSalvarSimulacao={handleSalvarNova}
        />
      </section>

      {simulacoes.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: temaAtual.texto }}>Métricas Salvas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulacoes.map((simulacao) => (
              <CardSimulacaoAtacado
                key={simulacao.id}
                simulacao={simulacao}
                onSelecionar={() => setSimulacaoSelecionada(simulacao)}
                onRemover={() => handleRemover(simulacao.id)}
                onEditar={handleEditar}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AtacadoPage;