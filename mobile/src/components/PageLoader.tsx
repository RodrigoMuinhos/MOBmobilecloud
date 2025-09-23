'use client';

import Spinner from './spinner';

export default function PageLoader({ label = 'Carregando...' }: { label?: string }) {
  return (
    <main className="min-h-[100dvh] grid place-items-center bg-white">
      <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-sm text-black/70">{label}</p>
      </div>
    </main>
  );
}
