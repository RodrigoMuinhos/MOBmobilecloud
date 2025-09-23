'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Eye, EyeOff, ArrowLeft } from 'lucide-react';

/** máscara simples de CPF */
function maskCPF(v: string) {
  return v
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

export default function RecuperarSenhaPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [cpf, setCpf] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // placeholders de ação – integre com sua API depois
  async function handleEnviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // await api.post('/auth/recuperar/enviar-codigo', { cpf: cpf.replace(/\D/g, '') });
      setStep(2);
    } finally {
      setLoading(false);
    }
  }

  async function handleRedefinir(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // await api.post('/auth/recuperar/confirmar', {
      //   cpf: cpf.replace(/\D/g, ''),
      //   codigo,
      //   novaSenha: senha,
      // });
      // router.push('/login');
      alert('Senha redefinida com sucesso (mock).');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-white flex items-start justify-center">
      <section className="w-full max-w-[420px] px-6 pt-6 pb-10">
        {/* topo com “avatar” e ícone de user */}
        <div className="flex items-center justify-center -mt-8">
          <div className="h-20 w-20 rounded-full bg-black shadow-lg ring-2 ring-black/10 flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 shadow-sm p-5">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-black">Recuperar senha</h1>
            <p className="text-sm text-black/80 mt-1">
              {step === 1
                ? 'Informe seu CPF para enviar o código.'
                : 'Digite o código recebido e defina a nova senha.'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleEnviarCodigo} className="space-y-4">
              <div>
                <label className="block text-xs text-black mb-1">CPF</label>
                <input
                  inputMode="numeric"
                  value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-black/20 bg-white px-3 py-3 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading || cpf.replace(/\D/g, '').length !== 11}
                className="w-full rounded-full bg-[#F15A24] text-black font-semibold py-3 shadow-sm hover:opacity-90 disabled:opacity-60 transition"
              >
                {loading ? 'Enviando…' : 'Enviar código'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRedefinir} className="space-y-4">
              <div>
                <label className="block text-xs text-black mb-1">CPF</label>
                <input
                  value={cpf}
                  readOnly
                  className="w-full rounded-xl border border-black/10 bg-black/5 px-3 py-3 text-black"
                />
              </div>

              <div>
                <label className="block text-xs text-black mb-1">Código</label>
                <input
                  inputMode="numeric"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6 dígitos"
                  className="w-full rounded-xl border border-black/20 bg-white px-3 py-3 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/20 tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs text-black mb-1">Nova senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-black/20 bg-white px-3 py-3 pr-12 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-black/70"
                    aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || codigo.length !== 6 || senha.length < 6}
                className="w-full rounded-full bg-[#F15A24] text-black font-semibold py-3 shadow-sm hover:opacity-90 disabled:opacity-60 transition"
              >
                {loading ? 'Redefinindo…' : 'Redefinir senha'}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/login" className="inline-flex items-center gap-2 text-black hover:underline">
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </Link>
            <Link href="/cadastro" className="text-black hover:underline">
              Criar conta
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-black/60">
          Preto = base • Laranja = destaque • Branco = predominante
        </p>
      </section>
    </main>
  );
}
