import React, { useEffect, useState } from 'react';
import MensagemPadraoBox from '../components/MensagemPadraoBox';
import TabelaClientesValidados from '../components/TabelaClientesValidados';
import { useTheme } from '../../../context/ThemeContext';

interface Cliente {
  cnpj: string | number;
  nomeFantasia?: string;
  nomeMatriz?: string;
  cidade?: string;
  uf?: string;
  contatos: string[];
}

const cores = ['cinza', 'azul', 'verde', 'vermelho', 'amarelo', 'roxo'] as const;

const classesCor: Record<string, string> = {
  cinza: 'bg-gray-400',
  azul: 'bg-blue-500',
  verde: 'bg-green-500',
  vermelho: 'bg-red-500',
  amarelo: 'bg-yellow-400',
  roxo: 'bg-purple-500',
};

const ClientesValidadosPage: React.FC = () => {
  const { temaAtual } = useTheme();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [busca, setBusca] = useState('');
  const [mensagensPorCor, setMensagensPorCor] = useState<Record<string, string>>({});

  const lerJSON = <T,>(chave: string, padrao: T): T => {
    try {
      const dados = localStorage.getItem(chave);
      return dados ? JSON.parse(dados) : padrao;
    } catch {
      return padrao;
    }
  };

  useEffect(() => {
    const salvos = lerJSON<Cliente[]>('cnpjValidados', []);
    const statusSalvos = lerJSON<Record<string, string>>('statusClientes', {});
    const mensagensSalvas = lerJSON<Record<string, string>>('modelosFixosWpp', {});

    const validos = salvos.filter((c) => c.cnpj && Array.isArray(c.contatos));
    setClientes(validos);
    setStatusMap(statusSalvos);
    setMensagensPorCor(mensagensSalvas);
  }, []);

  const atualizarLocalStorageClientes = (lista: Cliente[]) => {
    setClientes(lista);
    localStorage.setItem('cnpjValidados', JSON.stringify(lista));
  };

  const handleStatusClick = (cnpj: string | number, novaCor: string) => {
    setStatusMap((prev) => {
      const novo = { ...prev, [String(cnpj)]: novaCor };
      localStorage.setItem('statusClientes', JSON.stringify(novo));
      return novo;
    });
  };

  const handleStatusClickLote = (novoMapa: Record<string, string>) => {
    setStatusMap(novoMapa);
    localStorage.setItem('statusClientes', JSON.stringify(novoMapa));
  };

  const handleEditarContato = (cnpj: string | number, index: number, novo: string) => {
    const atualizados = clientes.map((c) => {
      if (c.cnpj === cnpj) {
        const contatos = [...c.contatos];
        contatos[index] = novo;
        return { ...c, contatos };
      }
      return c;
    });
    atualizarLocalStorageClientes(atualizados);
  };

  const handleRemoverContato = (cnpj: string | number, index: number) => {
    const atualizados = clientes.map((c) => {
      if (c.cnpj === cnpj) {
        const contatos = c.contatos.filter((_, i) => i !== index);
        return { ...c, contatos };
      }
      return c;
    });
    atualizarLocalStorageClientes(atualizados);
  };

  const handleRemoverCliente = (cnpj: string | number) => {
    const atualizados = clientes.filter((c) => c.cnpj !== cnpj);
    atualizarLocalStorageClientes(atualizados);
  };

  const contagemPorCor = cores.reduce((acc, cor) => {
    acc[cor] = clientes.filter((c) => statusMap[String(c.cnpj)] === cor).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
      <h2 className="text-lg font-bold mb-4">Clientes Validados</h2>

      <MensagemPadraoBox mensagem="" setMensagem={() => {}} />

      {/* Contadores por cor */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {cores.map((cor) => (
          <div key={cor} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${classesCor[cor]}`} />
            <span className="text-sm text-gray-700">{contagemPorCor[cor] || 0}</span>
          </div>
        ))}
      </div>

      <TabelaClientesValidados
        clientes={clientes}
        statusMap={statusMap}
        busca={busca}
        mensagensPorCor={mensagensPorCor}
        onStatusClick={handleStatusClick}
        onStatusClickLote={handleStatusClickLote}
        onEditarContato={handleEditarContato}
        onRemoverContato={handleRemoverContato}
        onRemover={handleRemoverCliente}
      />
    </div>
  );
};

export default ClientesValidadosPage;
