'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { FiUserPlus, FiSearch, FiCheck, FiX } from 'react-icons/fi';

/* =========================
   Paleta
========================= */
const ORANGE = '#F15A24';

/* =========================
   Tipos
========================= */
type ClienteMin = {
  id: string;
  nome: string;
  cpf?: string;
  whatsapp?: string;
  nascimento?: string; // YYYY-MM-DD
  cep?: string;        // 8 dígitos
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
};

/* =========================
   Utils (máscaras, validações, helpers)
========================= */
const onlyDigits = (s: string) => (s || '').replace(/\D+/g, '');
const norm = (s?: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

function maskCPF(v: string) {
  const s = onlyDigits(v).slice(0, 11);
  if (s.length <= 3) return s;
  if (s.length <= 6) return `${s.slice(0, 3)}.${s.slice(3)}`;
  if (s.length <= 9) return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6)}`;
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
}
function validarCPF(cpf: string) {
  const s = onlyDigits(cpf);
  if (s.length !== 11 || /^(\d)\1+$/.test(s)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(s[i]) * (10 - i);
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(s[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(s[i]) * (11 - i);
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(s[10]);
}

function maskCEP(v: string) {
  const s = onlyDigits(v).slice(0, 8);
  if (s.length <= 5) return s;
  return `${s.slice(0, 5)}-${s.slice(5)}`;
}
const validarCEP = (v: string) => onlyDigits(v).length === 8;

function maskPhoneBR(v: string) {
  const s = onlyDigits(v).slice(0, 11);
  if (s.length <= 2) return `(${s}`;
  if (s.length <= 6) return `(${s.slice(0, 2)}) ${s.slice(2)}`;
  if (s.length === 10) return `(${s.slice(0, 2)}) ${s.slice(2, 6)}-${s.slice(6)}`;
  return `(${s.slice(0, 2)}) ${s.slice(2, 7)}-${s.slice(7)}`;
}
function formatDateBR(yyyy_mm_dd?: string) {
  if (!yyyy_mm_dd) return '';
  const [y, m, d] = yyyy_mm_dd.split('-');
  if (!y || !m || !d) return yyyy_mm_dd;
  return `${d}/${m}/${y}`;
}

type ViaCEP = { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean };
async function viaCEP(cep: string): Promise<ViaCEP | null> {
  const s = onlyDigits(cep);
  if (s.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${s}/json/`);
    if (!res.ok) return null;
    const data = (await res.json()) as ViaCEP;
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

/* =========================
   API helpers
========================= */
async function fetchClientes(term: string): Promise<ClienteMin[]> {
  if (!term?.trim()) return [];
  const paramsList = ['q', 'search', 'busca'];
  for (const key of paramsList) {
    try {
      const { data } = await api.get('/clientes', { params: { [key]: term } });
      if (Array.isArray(data)) return data as ClienteMin[];
      if (Array.isArray(data?.items)) return data.items as ClienteMin[];
      if (Array.isArray(data?.results)) return data.results as ClienteMin[];
    } catch {}
  }
  return [];
}
async function criarCliente(payload: Record<string, any>): Promise<ClienteMin> {
  const { data } = await api.post('/clientes', payload);
  return data as ClienteMin;
}

/* =========================
   Página
========================= */
export default function NovaVendaClientePage() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 350);

  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ClienteMin[]>([]);
  const [selecionado, setSelecionado] = useState<ClienteMin | null>(null);

  const [abrirModal, setAbrirModal] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const list = await fetchClientes(debounced);
      if (active) setResultados(list);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [debounced]);

  // Filtro local (nome sem acento, CPF e WhatsApp por dígitos)
  const filtrados = useMemo(() => {
    const q = debounced.trim();
    if (!q) return resultados;
    const qDigits = onlyDigits(q);
    const qNorm = norm(q);
    return resultados.filter((c) => {
      const nomeOk = norm(c.nome).includes(qNorm);
      const cpfOk = qDigits ? onlyDigits(c.cpf || '').includes(qDigits) : false;
      const wppOk = qDigits ? onlyDigits(c.whatsapp || '').includes(qDigits) : false;
      return nomeOk || cpfOk || wppOk;
    });
  }, [resultados, debounced]);

  function avancar() {
    if (!selecionado) return;
    localStorage.setItem('nv_cliente', JSON.stringify(selecionado));
    router.push('/(tabs)/vendas/produtos');
  }

  return (
    <main className="min-h-dvh bg-[#F5F9F4] pb-24">
      <header className="px-4 py-3 border-b bg-white">
        <h1 className="text-base font-semibold text-black">Nova Venda — Cliente</h1>
      </header>

      <section className="p-4 space-y-3 max-w-md mx-auto">
        <label className="text-sm font-medium text-black">Cliente</label>

        {/* Busca principal */}
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtre por Nome, CPF ou WhatsApp"
            className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 pr-10 text-black placeholder-black/40 outline-none focus:ring-2 focus:ring-black/10"
          />
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60" />
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAbrirModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-black/20 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-black/5 active:scale-[0.98]"
          >
            <FiUserPlus /> Novo cliente
          </button>
        </div>

        {/* Selecionado */}
        {selecionado && (
          <div className="rounded-xl border border-black/15 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-black">{selecionado.nome}</div>
              <button
                onClick={() => setSelecionado(null)}
                className="p-1 rounded hover:bg-black/5"
                title="Trocar"
              >
                <FiX />
              </button>
            </div>
            <div className="mt-2 text-sm space-y-1 text-black">
              <div>CPF: {selecionado.cpf ? maskCPF(selecionado.cpf) : '—'}</div>
              <div>WhatsApp: {selecionado.whatsapp ? maskPhoneBR(selecionado.whatsapp) : '—'}</div>
              <div>Nascimento: {formatDateBR(selecionado.nascimento)}</div>
              <div>CEP: {selecionado.cep ? maskCEP(selecionado.cep) : '—'}</div>
              <div>
                Endereço:{' '}
                {[selecionado.logradouro, selecionado.numero, selecionado.bairro, selecionado.cidade, selecionado.uf]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </div>
            </div>
            <button
              onClick={avancar}
              className="mt-3 w-full rounded-xl font-semibold py-2 active:scale-[0.99]"
              style={{ background: ORANGE, color: '#000' }}
            >
              Confirmar
            </button>
          </div>
        )}

        {/* Lista */}
        <div className="rounded-xl bg-white border border-black/15 overflow-hidden">
          {loading ? (
            <div className="p-4 text-sm text-black/60">Buscando…</div>
          ) : filtrados.length === 0 ? (
            <div className="p-4 text-sm text-black/60">
              {debounced ? 'Nenhum cliente corresponde ao filtro.' : 'Digite para buscar/filtrar clientes.'}
            </div>
          ) : (
            <ul className="divide-y divide-black/10">
              {filtrados.map((c) => (
                <li
                  key={c.id}
                  className={`p-3 cursor-pointer transition ${
                    selecionado?.id === c.id ? 'bg-black/5' : 'hover:bg-black/[0.03]'
                  }`}
                  onClick={() => setSelecionado(c)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-black">{c.nome}</div>
                      <div className="text-xs text-black/60">
                        {c.cpf ? maskCPF(c.cpf) : 'CPF não informado'}
                        {c.whatsapp ? ` • ${maskPhoneBR(c.whatsapp)}` : ''}
                      </div>
                    </div>
                    {selecionado?.id === c.id && <FiCheck aria-label="Selecionado" className="text-black/70" />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          disabled={!selecionado}
          onClick={avancar}
          className="mt-2 w-full rounded-xl font-semibold py-3 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
          style={{ background: ORANGE, color: '#000' }}
        >
          Avançar
        </button>
      </section>

      {abrirModal && (
        <ModalNovoCliente
          onClose={() => setAbrirModal(false)}
          onSaved={(novo) => {
            setAbrirModal(false);
            setSelecionado(novo);
            try { window?.alert?.('Cliente criado com sucesso!'); } catch {}
          }}
        />
      )}
    </main>
  );
}

/* =========================
   Modal de novo cliente
========================= */
function ModalNovoCliente({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (c: ClienteMin) => void;
}) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [whats, setWhats] = useState('');

  const [nascimento, setNascimento] = useState(''); // yyyy-mm-dd
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Auto-preencher endereço quando CEP completo
  useEffect(() => {
    let alive = true;
    const s = onlyDigits(cep);
    if (s.length !== 8) return;
    setLoadingCep(true);
    viaCEP(s)
      .then((d) => {
        if (!alive || !d) return;
        setLogradouro(d.logradouro || '');
        setBairro(d.bairro || '');
        setCidade(d.localidade || '');
        setUf(d.uf || '');
      })
      .finally(() => alive && setLoadingCep(false));
    return () => {
      alive = false;
    };
  }, [cep]);

  const podeSalvar =
    nome.trim().length >= 2 && validarCPF(cpf) && Boolean(nascimento) && validarCEP(cep);

  async function salvar() {
    setErro(null);
    if (!podeSalvar) return;
    setSaving(true);
    try {
      const payload = {
        nome: nome.trim(),
        cpf: onlyDigits(cpf),
        whatsapp: onlyDigits(whats) || undefined,
        nascimento, // YYYY-MM-DD
        cep: onlyDigits(cep),
        logradouro: logradouro?.trim() || undefined,
        numero: numero?.trim() || undefined,
        bairro: bairro?.trim() || undefined,
        cidade: cidade?.trim() || undefined,
        uf: uf?.trim() || undefined,
      };
      const novo = await criarCliente(payload);
      onSaved(novo);
    } catch (e: any) {
      setErro(e?.response?.data?.erro || 'Falha ao criar cliente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-black">Novo cliente</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5">
            <FiX />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-black">Nome*</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Maria Silva"
              className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-black">CPF*</label>
            <input
              value={maskCPF(cpf)}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                cpf && !validarCPF(cpf)
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-black/20 focus:ring-black/10'
              }`}
            />
            {cpf && !validarCPF(cpf) && (
              <p className="text-xs text-red-600 mt-1">CPF inválido.</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-black">WhatsApp (opcional)</label>
            <input
              value={maskPhoneBR(whats)}
              onChange={(e) => setWhats(e.target.value)}
              placeholder="(00) 90000-0000"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-black">Nascimento*</label>
              <input
                type="date"
                value={nascimento}
                onChange={(e) => setNascimento(e.target.value)}
                className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black">CEP*</label>
              <input
                value={maskCEP(cep)}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                inputMode="numeric"
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                  cep && !validarCEP(cep)
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-black/20 focus:ring-black/10'
                }`}
              />
              {loadingCep && <p className="text-xs text-black/60 mt-1">Buscando endereço…</p>}
            </div>
          </div>

          <div className="rounded-lg border border-black/15 p-3 bg-black/[0.03]">
            <p className="text-xs font-medium text-black mb-2">
              Endereço <span className="font-normal text-black/60">(auto pelo CEP, editável)</span>
            </p>
            <div className="space-y-2">
              <input
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                placeholder="Logradouro"
                className="w-full rounded-lg border border-black/20 px-3 py-2 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Número"
                  className="rounded-lg border border-black/20 px-3 py-2 outline-none"
                />
                <input
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Bairro"
                  className="rounded-lg border border-black/20 px-3 py-2 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade"
                  className="rounded-lg border border-black/20 px-3 py-2 outline-none"
                />
                <input
                  value={uf}
                  onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="UF"
                  className="rounded-lg border border-black/20 px-3 py-2 outline-none"
                />
              </div>
            </div>
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <button
            onClick={salvar}
            disabled={!podeSalvar || saving}
            className="w-full rounded-xl font-semibold py-3 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            style={{ background: ORANGE, color: '#000' }}
          >
            {saving ? 'Salvando…' : 'Salvar e selecionar'}
          </button>
        </div>
      </div>
    </div>
  );
}
