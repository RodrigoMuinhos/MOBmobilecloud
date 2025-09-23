'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

export default function PreLogin() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-[url('/bg-pattern.png')] bg-cover bg-center relative">
      {/* overlay com blur e transparência */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md"></div>

      <section className="relative z-10 flex flex-col items-center p-6 w-full max-w-sm">
        {/* Avatar */}
        <div className="w-28 h-28 flex items-center justify-center rounded-full bg-black shadow-lg mb-6">
          <User size={48} className="text-white" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-black">MobSupply</h1>
        <p className="text-sm text-black mt-2 mb-8">
          Bem-vindo! Escolha como deseja continuar.
        </p>

        {/* Botões */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/login"
            className="w-full py-3 rounded-full bg-[#F15A24] text-black font-semibold text-center shadow-md hover:opacity-90 transition"
          >
            Entrar
          </Link>

          <Link
            href="/cadastro"
            className="w-full py-3 rounded-full border border-black text-black font-semibold text-center hover:bg-black/5 transition"
          >
            Cadastrar
          </Link>
        </div>

        {/* Rodapé */}
        <p className="text-xs text-black mt-8 text-center">
         - MOB SUPPLY -
        </p>
      </section>
    </main>
  );
}
