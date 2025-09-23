// src/components/VendaMobileHeader.tsx
'use client';

import Link from 'next/link';

type Props = {
  /** Título centralizado */
  titulo: string;
  /** Link opcional à esquerda (ex.: "/vendas/produtos"). Se não for passado, fica um espaçador. */
  backHref?: string;
  /**
   * Link opcional à direita. Se não for passado, mostra "Início" ("/").
   * Passe `false` para ocultar completamente.
   */
  rightLink?: { href: string; label: string } | false;
};

export default function VendaMobileHeader({
  titulo,
  backHref,
  rightLink,
}: Props) {
  // padrão à direita: "Início"
  const right =
    rightLink === false ? null : rightLink ?? { href: '/', label: 'Início' };

  return (
    <header className="sticky top-0 z-20 bg-white border-b">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Esquerda: Voltar (opcional) */}
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm underline text-black/70 hover:text-black"
            aria-label="Voltar"
          >
            {/* setinha para trás em SVG, sem libs extras */}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            Voltar
          </Link>
        ) : (
          <span className="w-[64px]" aria-hidden /> /* espaçador p/ centralizar título */
        )}

        {/* Título central */}
        <h1 className="text-base font-semibold text-black text-center truncate">
          {titulo}
        </h1>

        {/* Direita: link (padrão Início) ou espaçador */}
        {right ? (
          <Link
            href={right.href}
            className="text-sm underline text-black/70 hover:text-black"
          >
            {right.label}
          </Link>
        ) : (
          <span className="w-[64px]" aria-hidden />
        )}
      </div>
    </header>
  );
}
