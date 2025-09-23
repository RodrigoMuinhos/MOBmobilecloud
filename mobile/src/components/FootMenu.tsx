// mobile/src/components/FootMenu.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Users, Boxes, User } from 'lucide-react';

const items = [
  { href: '/vendas', icon: ShoppingCart },
  { href: '/clientes', icon: Users },
  { href: '/estoque', icon: Boxes },
  { href: '/perfil', icon: User },
];

export default function FootMenu() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      {items.map(({ href, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link key={href} href={href} className="flex flex-col items-center">
            <Icon
              size={24}
              className={`transition-colors ${
                active ? 'text-brand-orange' : 'text-gray-500'
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
