import React, { useEffect, useState } from 'react';
import { FaCheck, FaPlus, FaTimes } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';

export type Produto = {
  id?: string;
  codigo: string;
  nome: string;
  quantidade: number;
  preco: number;
  valorVenda: string;
};

const formatarMoeda = (valor: number) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

const ProdutosConfigPage: React.FC = () => {
  const { temaAtual } = useTheme();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [valoresInputs, setValoresInputs] = useState<Record<string, { preco: string; valorVenda: string }>>({});

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const res = await api.get('/produtos');
      const produtosAPI: Produto[] = res.data;

      setProdutos(produtosAPI);

      const valoresIniciais: Record<string, { preco: string; valorVenda: string }> = {};
      produtosAPI.forEach((p) => {
        valoresIniciais[p.codigo] = {
          preco: p.preco.toFixed(2).replace('.', ','),
          valorVenda: p.valorVenda.replace('.', ','),
        };
      });
      setValoresInputs(valoresIniciais);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const salvarProdutos = async () => {
    try {
      for (const produto of produtos) {
        const payload = {
          ...produto,
          valorVenda: produto.valorVenda.replace(',', '.'),
        };

        if (produto.id) {
          await api.put(`/produtos/${produto.id}`, payload);
        } else {
          await api.post('/produtos', payload);
        }
      }
      alert('Produtos salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
      alert('Erro ao salvar produtos.');
    }
  };

  const adicionarProduto = () => {
    const novo: Produto = {
      codigo: `PROD-${Date.now()}`,
      nome: 'Novo Produto',
      quantidade: 0,
      preco: 0,
      valorVenda: '0',
    };
    setProdutos((prev) => [...prev, novo]);
    setValoresInputs((prev) => ({
      ...prev,
      [novo.codigo]: { preco: '', valorVenda: '' },
    }));
  };

  const removerProduto = async (index: number) => {
    const copia = [...produtos];
    const removido = copia[index];
    if (removido.id) {
      await api.delete(`/produtos/${removido.id}`);
    }
    copia.splice(index, 1);
    setProdutos(copia);

    const novaTabela = { ...valoresInputs };
    delete novaTabela[removido.codigo];
    setValoresInputs(novaTabela);
  };

  const handleChange = (index: number, campo: keyof Produto, valor: string) => {
    const novosProdutos = produtos.map((produto, i) => {
      if (i !== index) return produto;

      const atualizado = { ...produto };
      if (campo === 'quantidade') {
        const qtd = parseInt(valor.replace(/\D/g, ''), 10);
        atualizado.quantidade = isNaN(qtd) ? 0 : qtd;
      } else {
        (atualizado as any)[campo] = valor;
      }

      return atualizado;
    });

    setProdutos(novosProdutos);
  };

  const handleInputChange = (codigo: string, campo: 'preco' | 'valorVenda', valor: string) => {
    setValoresInputs((prev) => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        [campo]: valor,
      },
    }));
  };

  const handleBlur = (index: number, campo: 'preco' | 'valorVenda') => {
    const valorDigitado = valoresInputs[produtos[index].codigo]?.[campo] || '';
    const limpo = valorDigitado.replace(/[^\d,]/g, '').replace(',', '.');
    const numero = parseFloat(limpo);

    const novosProdutos = produtos.map((produto, i) => {
      if (i !== index) return produto;

      return {
        ...produto,
        [campo]: campo === 'preco'
          ? isNaN(numero) ? 0 : parseFloat(numero.toFixed(2))
          : isNaN(numero) ? '0' : numero.toFixed(2),
      };
    });

    setProdutos(novosProdutos);

    setValoresInputs((prev) => ({
      ...prev,
      [produtos[index].codigo]: {
        ...prev[produtos[index].codigo],
        [campo]: isNaN(numero) ? '' : numero.toFixed(2).replace('.', ','),
      },
    }));
  };

  const getCorEstoque = (qtd: number): string => {
    const isDark = temaAtual.fundo === '#0f0f0f';

    if (qtd === 0) return isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-800';
    if (qtd <= 10) return isDark ? 'bg-red-900 text-red-300' : 'bg-red-300 text-red-900';
    if (qtd <= 20) return isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-200 text-yellow-900';
    if (qtd >= 300) return 'bg-blue-900 text-white';
    if (qtd >= 200) return 'bg-blue-600 text-white';
    if (qtd >= 150) return 'bg-blue-300 text-blue-900';
    return '';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold" style={{ color: temaAtual.texto }}>Configurar Produtos</h2>
        <button onClick={adicionarProduto} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          <FaPlus /> Adicionar
        </button>
      </div>

      <div className="grid gap-4">
        {produtos.map((produto, index) => (
          <div key={produto.codigo} className={`p-4 rounded-lg shadow ${getCorEstoque(produto.quantidade)}`}>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input
                value={produto.nome}
                onChange={(e) => handleChange(index, 'nome', e.target.value)}
                placeholder="Nome"
                className="flex-1 p-2 rounded border"
              />

              <input
                value={produto.quantidade.toString()}
                onChange={(e) => handleChange(index, 'quantidade', e.target.value)}
                placeholder="Quantidade"
                className="w-32 p-2 rounded border text-center"
              />

              <input
                value={valoresInputs[produto.codigo]?.preco || ''}
                onChange={(e) => handleInputChange(produto.codigo, 'preco', e.target.value)}
                onBlur={() => handleBlur(index, 'preco')}
                placeholder="Preço de custo"
                className="w-32 p-2 rounded border text-center"
              />

              <input
                value={valoresInputs[produto.codigo]?.valorVenda || ''}
                onChange={(e) => handleInputChange(produto.codigo, 'valorVenda', e.target.value)}
                onBlur={() => handleBlur(index, 'valorVenda')}
                placeholder="Preço de venda"
                className="w-32 p-2 rounded border text-center"
              />

              <button onClick={() => removerProduto(index)} className="text-red-500 hover:scale-110">
                <FaTimes />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={salvarProdutos} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
          <FaCheck /> Salvar Tudo
        </button>
      </div>
    </div>
  );
};

export default ProdutosConfigPage;
