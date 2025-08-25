// hooks/useEstoque.ts
import { useEffect, useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import api from '../services/api';
import { EstoqueBanco, ProdutoEstoqueAPI } from '../types/banco';
import { estoqueData as estoqueInicial } from '../data/estoqueData';

export const useEstoque = () => {
  const [estoque, setEstoque] = useState<EstoqueBanco>({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const carregarEstoqueAPI = async () => {
    try {
      const response = await api.get('/estoque');
      const lista: ProdutoEstoqueAPI[] = response.data;

      const agrupado: EstoqueBanco = {};
      lista.forEach((item) => {
        const categoria = item.marca || 'Outros';
        const tipo = item.tipo || 'Padrão';

        if (!agrupado[categoria]) agrupado[categoria] = {};
        if (!agrupado[categoria][tipo]) agrupado[categoria][tipo] = [];

        agrupado[categoria][tipo].push({
          codigo: item.id || `${categoria}-${tipo}-${Date.now()}`,
          nome: item.nome || '',
          tipo,
          marca: categoria,
          preco_compra: item.preco_compra || 0,
          preco_venda_caixa: item.preco_venda_caixa || 0,
          preco_venda_unidade: item.preco_venda_unidade || 0,
          preco_caixa: item.preco_venda_caixa || 0,
          preco_unit: item.preco_venda_unidade || 0,
          quantidade_em_estoque: item.quantidade_em_estoque || 0,
          unidades_por_caixa: item.unidades_por_caixa || 0,
          caixas: item.caixas || 0,
        });
      });

      setEstoque(agrupado);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
      alert('❌ Erro ao carregar o estoque do servidor.');
    }
  };

  useEffect(() => {
    carregarEstoqueAPI();
  }, []);

  const salvarEstoque = async () => {
    try {
      const lista = Object.entries(estoque).flatMap(([marca, tipos]) =>
        Object.entries(tipos).flatMap(([tipo, itens]) =>
          itens.map((item) => ({
            id: item.codigo,
            nome: item.nome,
            tipo,
            marca,
            preco_venda_caixa: item.preco_caixa,
            preco_venda_unidade: item.preco_unit,
            preco_compra: item.preco_compra,
            quantidade_em_estoque: item.quantidade_em_estoque,
            unidades_por_caixa: item.unidades_por_caixa,
            caixas: item.caixas || 0,
          }))
        )
      );

      const response = await api.put('/estoque', lista);
      if (response.status === 200) alert('Estoque salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar estoque:', error);
      alert('❌ Erro ao salvar estoque no servidor.');
    }
  };

  const exportarPDF = () => {
    if (pdfRef.current) {
      html2pdf()
        .set({
          margin: 0.3,
          filename: 'estoque-mob-supply.pdf',
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        })
        .from(pdfRef.current)
        .save();
    }
  };

  const exportarJSON = () => {
    const blob = new Blob([JSON.stringify(estoque, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'estoque-mob-supply.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importarJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json && typeof json === 'object') {
            setEstoque(json);
            alert('Estoque importado com sucesso!');
          }
        } catch {
          alert('Erro ao importar o JSON.');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const limparEstoque = () => {
    if (window.confirm('Tem certeza que deseja limpar o estoque?')) {
      setEstoque({ ...estoqueInicial });
    }
  };

  return {
    estoque,
    setEstoque,
    mostrarModal,
    setMostrarModal,
    pdfRef,
    carregarEstoqueAPI,
    salvarEstoque,
    exportarPDF,
    exportarJSON,
    importarJSON,
    limparEstoque,
  };
};
