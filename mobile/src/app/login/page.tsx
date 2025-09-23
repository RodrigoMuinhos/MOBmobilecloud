// src/app/login/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

/** Máscara CPF: "08889833329" -> "088.898.333-29" */
function formatCpf(v: string) {
  const only = v.replace(/\D/g, '').slice(0, 11);
  const p1 = only.slice(0, 3), p2 = only.slice(3, 6), p3 = only.slice(6, 9), p4 = only.slice(9, 11);
  let out = p1;
  if (p2) out += '.' + p2;
  if (p3) out += '.' + p3;
  if (p4) out += '-' + p4;
  return out;
}

export default function LoginPage() {
  const { login } = useAuth();

  // ---- estados
  const [cpfMasked, setCpfMasked] = useState('');
  const cpfRaw = cpfMasked.replace(/\D/g, '');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // avatar (seleção de foto)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const remember = localStorage.getItem('MS_REMEMBER') === '1';
      const savedCpf = localStorage.getItem('MS_SAVED_CPF') || '';
      const savedPw  = localStorage.getItem('MS_SAVED_PW')  || '';
      const savedAv  = localStorage.getItem('MS_LOGIN_AVATAR') || '';
      setLembrar(remember);
      if (savedCpf) setCpfMasked(formatCpf(savedCpf));
      if (remember && savedPw) setSenha(savedPw);
      if (savedAv) setAvatarUrl(savedAv);
    } catch {}
  }, []);

  const onCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpfMasked(formatCpf(e.target.value));
  };

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      setAvatarUrl(url);
      localStorage.setItem('MS_LOGIN_AVATAR', url);
    };
    reader.readAsDataURL(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(cpfRaw, senha);

      document.cookie = `MS_AUTH_TOKEN=1; path=/`;
      localStorage.setItem('MS_SAVED_CPF', cpfRaw);
      localStorage.setItem('MS_REMEMBER', lembrar ? '1' : '0');
      if (lembrar) localStorage.setItem('MS_SAVED_PW', senha);
      else localStorage.removeItem('MS_SAVED_PW');

      location.href = '/home';
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F9F8F6]">
      {/* faixa superior preta (base) */}
      <div className="h-24 w-full bg-black" />

      <main className="px-6 -mt-12 flex flex-col items-center">
        {/* Avatar destacado */}
        <div className="relative">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Selecionar foto do usuário"
            className="w-28 h-28 rounded-full bg-white border-2 border-black shadow-md grid place-items-center overflow-hidden"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Foto do usuário" className="w-full h-full object-cover" />
            ) : (
              // Ícone de usuário
              <svg viewBox="0 0 24 24" className="h-12 w-12 text-black" fill="currentColor" aria-hidden="true">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5Z"/>
              </svg>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickAvatar}
          />
        </div>

        {/* Card branco (predominante) com destaques em laranja */}
        <form
          onSubmit={onSubmit}
          className="mt-4 w-full max-w-sm bg-white border border-black/10 rounded-2xl shadow-sm p-5 space-y-4"
        >
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-[#F15A24]" />
            <h1 className="text-xl font-bold text-black">Login</h1>
            <p className="text-xs text-black/60 mt-1">Acesse sua conta para continuar</p>
          </div>

          {/* CPF */}
          <div>
            <label className="block text-xs text-black/70 mb-1">CPF</label>
            <input
              value={cpfMasked}
              onChange={onCpfChange}
              placeholder="000.000.000-00"
              className="w-full rounded-xl border border-black/20 px-3 py-3 outline-none bg-white
                         focus:ring-2 focus:ring-[#F15A24]/50 focus:border-[#F15A24] transition"
              inputMode="numeric"
              autoComplete="username"
              maxLength={14}
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs text-black/70 mb-1">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                className="w-full rounded-xl border border-black/20 px-3 py-3 pr-24 outline-none bg-white
                           focus:ring-2 focus:ring-[#F15A24]/50 focus:border-[#F15A24] transition"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((s) => !s)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 rounded-lg border
                           border-black/20 bg-white hover:bg-black hover:text-white transition"
              >
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {/* Lembrar senha */}
            <div className="mt-2">
              <label className="inline-flex items-center gap-2">
                <input
                  id="lembrar"
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                  className="h-4 w-4 accent-[#F15A24]"
                />
                <span className="text-sm select-none text-black">
                  Salvar senha neste dispositivo
                </span>
              </label>
            </div>

            <p className="text-[11px] text-black/50 mt-1">
              Dica: desmarque em dispositivos compartilhados.
            </p>
          </div>

          {err && <p className="text-[#F15A24] text-sm">{err}</p>}

          {/* Botão principal */}
          <button
            type="submit"
            disabled={loading || cpfRaw.length !== 11 || senha.length === 0}
            className={`w-full rounded-2xl py-3 font-semibold bg-[#F15A24] text-black
                        hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition
                        ${loading ? 'animate-pulse' : ''}`}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          {/* Ações secundárias abaixo do botão */}
          <div className="mt-2 flex flex-col items-center gap-2">
            <Link
              href="/recuperar-senha"
              className="text-sm text-black/50 hover:text-black underline underline-offset-2"
            >
              Recuperar senha
            </Link>
            <Link
              href="/cadastro"
              className="text-sm text-black underline underline-offset-2"
            >
              Cadastrar
            </Link>
          </div>
        </form>

        <div className="h-10" />
      </main>
    </div>
  );
}
