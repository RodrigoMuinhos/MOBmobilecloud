// mobile/src/app/(tabs)/vendas/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendasIndex() {
  const r = useRouter();
  useEffect(() => { r.replace('/(tabs)/vendas/cliente'); }, [r]);
  return null;
}
