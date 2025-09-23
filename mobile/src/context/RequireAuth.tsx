// mobile/src/components/RequireAuth.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) return null; // poderia ser um spinner
  if (!user) return null;

  const isOffline = user.id === 'offline-admin';

  return (
    <>
      {isOffline && (
        <div className="bg-yellow-200 text-yellow-900 text-sm text-center p-2">
          ⚠ Você está no modo <strong>OFFLINE</strong>. Algumas funções podem não estar disponíveis.
        </div>
      )}
      {children}
    </>
  );
}
