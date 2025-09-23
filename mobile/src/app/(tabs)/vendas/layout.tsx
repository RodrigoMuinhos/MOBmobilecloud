'use client';
import { VendaMobileProvider } from '@/context/VendaMobileContext';

export default function VendasLayout({ children }: { children: React.ReactNode }) {
  return <VendaMobileProvider>{children}</VendaMobileProvider>;
}
