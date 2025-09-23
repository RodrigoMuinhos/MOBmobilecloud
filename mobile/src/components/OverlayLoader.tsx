// src/components/OverlayLoader.tsx
'use client';
import Spinner from './spinner';

export default function OverlayLoader({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm">
      <div role="status" aria-busy="true" className="flex flex-col items-center gap-3">
        <Spinner />
        {label && <p className="text-sm text-black/70">{label}</p>}
      </div>
    </div>
  );
}
