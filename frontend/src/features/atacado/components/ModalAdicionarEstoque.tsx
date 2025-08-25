'use client';
import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Distribuidor, Produto } from '../../../types/Distribuidor';

type Props = {
  distribuidorId: string;
  distribuidor: Distribuidor;
  onClose: () => void;
};

export default function ModalAdicionarEstoque({ distribuidorId, distribuidor, onClose }: Props) {
  const { temaAtual } = useTheme();

  const [modelo, setModelo] = useState('');
  const [qtdCaixas, setQtdCaixas] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [frete, setFrete] = useState('');
  const [estoques, setEstoques] = useState<Produto[]>([]);

  const totalCaixas = estoques.reduce((acc, item) => acc + item.qtd, 0);
  const totalProdutos = estoques.reduce((acc, item) => acc + item.qtd * item.valorVenda, 0);
  const freteValor = parseFloat(frete.replace(',', '.')) || 0;
  const totalFinal = totalProdutos + freteValor;

  const telefoneDistribuidor = distribuidor.telefone || distribuidor.wpp || '';

  const gerarCodigo = () => {
    const sufixo = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VX-${sufixo}`;
  };

  const handleAdicionarProduto = () => {
    if (!modelo || !qtdCaixas || !valorVenda) return alert('Preencha todos os campos obrigatórios.');
    const novo: Produto = {
      id: uuidv4(),
      codigo: gerarCodigo(),
      modelo,
      qtd: Number(qtdCaixas),
      valorVenda: parseFloat(valorVenda.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
      frete: freteValor,
    };
    setEstoques(prev => [...prev, novo]);
    setModelo('');
    setQtdCaixas('');
    setValorVenda('');
  };

  const removerProduto = (id: string) => {
    setEstoques(prev => prev.filter(p => p.id !== id));
  };

  const salvarNoLocalStorage = () => {
    if (estoques.length === 0) return alert('Adicione ao menos 1 produto.');
    if (!telefoneDistribuidor.trim()) {
      alert('Telefone do distribuidor está ausente ou inválido.');
      return;
    }

    const dataAtual = new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
    const lotesExistentes = Object.keys(localStorage).filter(key =>
      key.startsWith(`VENDA_${distribuidorId}_`)
    );
    const numeroLote = lotesExistentes.length + 1;

    const lote = {
      nome: `Lote ${numeroLote}`,
      data: dataAtual,
      totalCaixas,
      totalValor: totalFinal,
      estoques,
      distribuidor: {
        nome: distribuidor.nome,
        telefone: telefoneDistribuidor,
        email: distribuidor.email,
        endereco: distribuidor.endereco,
        bairro: distribuidor.bairro,
        cidade: distribuidor.cidade,
        estado: distribuidor.estado,
        cep: distribuidor.cep,
        cpf: distribuidor.cpf,
        nascimento: distribuidor.nascimento,
        studio: distribuidor.studio,
      }
    };

    const id = `VENDA_${distribuidorId}_${Date.now()}`;
    localStorage.setItem(id, JSON.stringify(lote));

    alert('Estoque salvo com sucesso!');
    onClose();
  };

  const gerarReciboPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text(`Recibo de Produtos`, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    const y = 30;
    doc.text(`Distribuidor: ${distribuidor.nome}`, 14, y);
    doc.text(`Telefone: ${telefoneDistribuidor}`, 14, y + 5);
    doc.text(`Email: ${distribuidor.email}`, 14, y + 10);
    doc.text(`CPF: ${distribuidor.cpf}`, 14, y + 15);
    doc.text(`Endereço: ${distribuidor.endereco}, ${distribuidor.bairro}`, 14, y + 20);
    doc.text(`Cidade: ${distribuidor.cidade}/${distribuidor.estado} - CEP: ${distribuidor.cep}`, 14, y + 25);
    doc.text(`Studio: ${distribuidor.studio}`, 14, y + 30);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, y + 35);

    autoTable(doc, {
      startY: y + 40,
      head: [['Código', 'Modelo', 'Qtd', 'Valor Unitário', 'Subtotal']],
      body: estoques.map(item => [
        item.codigo,
        item.modelo,
        item.qtd,
        `R$ ${item.valorVenda.toFixed(2)}`,
        `R$ ${(item.qtd * item.valorVenda).toFixed(2)}`
      ]),
      foot: [
        ['', '', `Total: ${totalCaixas} cx`, '', `R$ ${totalProdutos.toFixed(2)}`],
        ['', '', 'Frete', '', `R$ ${freteValor.toFixed(2)}`],
        ['', '', 'Total Final', '', `R$ ${totalFinal.toFixed(2)}`],
      ]
    });

    doc.save(`recibo_${distribuidor.nome.replace(/\s/g, '_')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg w-full max-w-2xl p-6 relative"
        style={{ background: temaAtual.card, color: temaAtual.texto }}
      >
        <button
          className="absolute top-2 right-3 text-xl font-bold"
          onClick={onClose}
          style={{ color: temaAtual.texto }}
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-4">Adicionar Estoque</h2>

        {/* Inputs de produto */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <input type="text" placeholder="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} className="p-2 border rounded text-black" />
          <input type="number" placeholder="Qtd (caixas)" value={qtdCaixas} onChange={(e) => setQtdCaixas(e.target.value)} className="p-2 border rounded text-black" />
          <input type="text" placeholder="Valor unitário" value={valorVenda} onChange={(e) => setValorVenda(e.target.value)} className="p-2 border rounded text-black" />
        </div>

        {/* Botão de adicionar produto */}
        <button onClick={handleAdicionarProduto} className="w-full py-2 rounded font-semibold mb-2" style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoClaro }}>
          + Adicionar Produto
        </button>

        {/* Campo de frete separado */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Frete total"
            value={frete}
            onChange={(e) => setFrete(e.target.value)}
            className="p-2 border rounded text-black w-full"
          />
        </div>

        {/* Lista de produtos adicionados */}
        {estoques.length > 0 && (
          <>
            <h3 className="font-semibold">Produtos Adicionados:</h3>
            <div className="space-y-2 text-sm">
              {estoques.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b py-1">
                  <div className="flex gap-2">
                    <span className="font-mono text-xs">{item.codigo}</span>
                    <span>{item.modelo}</span>
                  </div>
                  <span>{item.qtd} cx</span>
                  <span>R$ {item.valorVenda.toFixed(2)}</span>
                  <button onClick={() => removerProduto(item.id)} className="text-red-500 font-bold ml-2">×</button>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm border-t pt-2 space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Total de Caixas</span>
                <span>{totalCaixas} cx</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total dos Produtos</span>
                <span>R$ {totalProdutos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-yellow-700">
                <span>Frete</span>
                <span>R$ {freteValor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-green-700 border-t pt-2 mt-2">
                <span>Total Final</span>
                <span>R$ {totalFinal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* Ações */}
        <div className="flex justify-between gap-4 mt-6">
          <button onClick={gerarReciboPDF} className="w-full py-2 rounded font-semibold" style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoClaro }}>
            📄 Gerar Recibo PDF
          </button>
          <button onClick={salvarNoLocalStorage} className="w-full py-2 rounded font-semibold" style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoClaro }}>
            💾 Salvar Estoque
          </button>
        </div>
      </div>
    </div>
  );
}