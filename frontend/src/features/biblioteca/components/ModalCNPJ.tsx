import React, { useEffect, useState } from 'react';
import { FaSave, FaWhatsapp, FaTimes, FaPlus } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

type Cliente = {
  cnpj?: string | null;
  nomeFantasia?: string | null;
  nomeMatriz?: string | null;
  cidade?: string | null;
  uf?: string | null;
  contatos?: string[];
  status?: number;
};

type Props = {
  cliente: Cliente;
  onFechar: () => void;
};

const ModalCNPJ: React.FC<Props> = ({ cliente, onFechar }) => {
  const { temaAtual } = useTheme();
  const [editado, setEditado] = useState<Cliente>(() => {
    const salvos = JSON.parse(localStorage.getItem('cnpjValidados') || '[]');
    const existente = salvos.find((c: Cliente) => c.cnpj === cliente.cnpj);
    return {
      ...cliente,
      ...existente,
      contatos: existente?.contatos || [''],
    };
  });

  const [mensagem, setMensagem] = useState<string>('');

  useEffect(() => {
    setMensagem(`Olá! Sou da equipe MOB Supply.

Vim conferir se você está precisando de algo no momento.

Temos cartuchos de alta qualidade das marcas SkinInk e VX Craft, ideais para quem busca excelência no resultado!

🛍 Ganhe 10% de desconto ou frete grátis na sua primeira compra.

Aproveite para nos seguir no Instagram e ficar por dentro das novidades:
👉 instagram.com/mob.supplybr

Conte com a gente! 💬.`);
  }, []);

  const gerarLinkWhatsApp = () => {
    const primeiroNumero = editado.contatos?.[0]?.replace(/\D/g, '');
    if (!primeiroNumero || primeiroNumero.length < 10) return '#';
    return `https://wa.me/55${primeiroNumero}?text=${encodeURIComponent(mensagem)}`;
  };

  const salvarClienteValidado = () => {
    const salvos = JSON.parse(localStorage.getItem('cnpjValidados') || '[]');
    const atualizados = salvos.filter((c: Cliente) => c.cnpj !== editado.cnpj);
    atualizados.push({ ...editado });
    localStorage.setItem('cnpjValidados', JSON.stringify(atualizados));
    alert('Salvo com sucesso no cnpjValidados!');
    onFechar();
  };

  const atualizarContato = (index: number, valor: string) => {
    const contatosAtualizados = [...(editado.contatos || [])];
    contatosAtualizados[index] = valor;
    setEditado({ ...editado, contatos: contatosAtualizados });
  };

  const adicionarContato = () => {
    setEditado({ ...editado, contatos: [...(editado.contatos || []), ''] });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      style={{ backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md p-6 rounded-lg shadow-xl relative"
        style={{
          background: temaAtual.cardGradient || temaAtual.card,
          color: temaAtual.texto,
          border: `1px solid ${temaAtual.destaque}`,
        }}
      >
        <button
          onClick={onFechar}
          className="absolute top-2 right-2"
          style={{ color: temaAtual.texto }}
        >
          <FaTimes />
        </button>

        <h2 className="text-lg font-bold mb-4">Ficha do Cliente</h2>

        <div className="space-y-3 text-sm">
          <div><strong>CNPJ:</strong> {editado.cnpj}</div>

          <div>
            <label>Nome Fantasia:</label>
            <input
              className="w-full border px-2 py-1 rounded text-sm"
              style={{
                backgroundColor: temaAtual.fundoAlt,
                color: temaAtual.texto,
                borderColor: temaAtual.destaque,
              }}
              value={editado.nomeFantasia || ''}
              onChange={(e) => setEditado({ ...editado, nomeFantasia: e.target.value })}
            />
          </div>

          <div>
            <label>Cidade:</label>
            <input
              className="w-full border px-2 py-1 rounded text-sm"
              style={{
                backgroundColor: temaAtual.fundoAlt,
                color: temaAtual.texto,
                borderColor: temaAtual.destaque,
              }}
              value={editado.cidade || ''}
              onChange={(e) => setEditado({ ...editado, cidade: e.target.value })}
            />
          </div>

          <div>
            <label>UF:</label>
            <input
              className="w-full border px-2 py-1 rounded text-sm"
              style={{
                backgroundColor: temaAtual.fundoAlt,
                color: temaAtual.texto,
                borderColor: temaAtual.destaque,
              }}
              value={editado.uf || ''}
              onChange={(e) =>
                setEditado({ ...editado, uf: e.target.value.toUpperCase() })
              }
            />
          </div>

          <div>
            <label>Contatos WhatsApp:</label>
            {editado.contatos?.map((contato, i) => (
              <input
                key={i}
                className="w-full border px-2 py-1 mb-1 rounded text-sm"
                placeholder="(DDD) 9 9999-9999"
                style={{
                  backgroundColor: temaAtual.fundoAlt,
                  color: temaAtual.texto,
                  borderColor: temaAtual.destaque,
                }}
                value={contato}
                onChange={(e) => atualizarContato(i, e.target.value)}
              />
            ))}
            <button
              onClick={adicionarContato}
              className="text-sm flex items-center gap-1 mt-1"
              style={{ color: temaAtual.destaque }}
            >
              <FaPlus /> Adicionar contato
            </button>
          </div>

          <div>
            <label>Mensagem automática:</label>
            <textarea
              className="w-full border px-2 py-2 rounded text-sm"
              rows={4}
              style={{
                backgroundColor: temaAtual.fundoAlt,
                color: temaAtual.texto,
                borderColor: temaAtual.destaque,
              }}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onFechar}
            className="px-4 py-2 rounded border text-sm transition hover:opacity-80"
            style={{
              borderColor: temaAtual.destaque,
              color: temaAtual.texto,
            }}
          >
            Fechar
          </button>

          <div className="flex gap-2">
            <a
              href={gerarLinkWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-green-700"
            >
              <FaWhatsapp /> Enviar
            </a>
            <button
              onClick={salvarClienteValidado}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-blue-700"
            >
              <FaSave /> Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCNPJ;
