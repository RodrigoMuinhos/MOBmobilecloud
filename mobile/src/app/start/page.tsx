// src/app/start/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function StartPage() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 2000); // fade-out após 2s
    const t2 = setTimeout(() => router.replace('/prelogin'), 3000); // vai para PRE-LOGIN
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [router]);

  return (
    <main className="relative min-h-[100dvh] w-full bg-white flex items-center justify-center">
      <Image
        src="/brand/logo.png"
        alt="MobSupply"
        fill
        priority
        className={`object-contain transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
    </main>
  );
}
