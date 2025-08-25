// src/features/estoque/components/ModalCriarFilial.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import api from '../../../services/api';
import type { FilialAPI } from './AbasFiliais';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (filial: FilialAPI) => void;
  tema: any; // ▼ aplica as cores do seu ThemeContext
};

const UF = [
   'CE','PA','PE'
];

const ModalCriarFilial: React.FC<Props> = ({ open, onClose, onCreated, tema }) => {
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setErro(null);
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const validar = () => {
    if (!cidade.trim()) return 'Cidade é obrigatória.';
    if (!estado.trim()) return 'UF é obrigatória.';
    if (estado.trim().length !== 2) return 'UF deve ter 2 letras.';
    return null;
  };

  const salvar = async () => {
    const msg = validar();
    if (msg) {
      setErro(msg);
      return;
    }
    if (salvando) return;

    setSalvando(true);
    try {
      const payload = {
        nome: (nome || `${cidade.trim()}-${estado.trim().toUpperCase()}`).trim(),
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
        ativa: true,
      };
      const { data } = await api.post<FilialAPI>('/filiais', payload);
      onCreated(data);
      onClose();
      setNome(''); setCidade(''); setEstado('');
    } catch (e) {
      console.error(e);
      setErro('Erro ao criar local de estoque.');
    } finally {
      setSalvando(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') salvar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // fechar ao clicar no fundo
      }}
      onKeyDown={onKeyDown}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{
          backgroundColor: tema.card,
          color:      tema.texto,
          border:     `1px solid ${tema.destaque}`,
        }}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: tema.titulo }}>
          Novo Local de Estoque
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm" style={{ color: tema.textoSuave }}>Nome (opcional)</label>
            <input
              ref={firstInputRef}
              className="w-full rounded border px-3 py-2"
              style={{ background: tema.fundoAlt, color: tema.texto, borderColor: tema.destaque }}
              placeholder="Ex.: Matriz Belém"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm" style={{ color: tema.textoSuave }}>Cidade *</label>
            <input
              className="w-full rounded border px-3 py-2"
              style={{ background: tema.fundoAlt, color: tema.texto, borderColor: tema.destaque }}
              placeholder="Ex.: Belém"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm" style={{ color: tema.textoSuave }}>UF *</label>
            <select
              className="w-full rounded border px-3 py-2"
              style={{ background: tema.fundoAlt, color: tema.texto, borderColor: tema.destaque }}
              value={estado}
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
            >
              <option value="">Selecione...</option>
              {UF.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          {erro && (
            <div className="text-sm mt-1" style={{ color: tema.erro ?? '#dc2626' }}>
              {erro}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded border"
            style={{ borderColor: tema.destaque, color: tema.texto }}
            onClick={onClose}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded text-white disabled:opacity-50"
            style={{ backgroundColor: tema.acento ?? '#2e7d32' }}
            onClick={salvar}
            disabled={salvando}
          >
            {salvando ? 'Salvando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCriarFilial;
