// app/(tabs)/vendas/finalizar/page.tsx
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/vendas/pagamento'); // manda para a 1ª etapa do novo fluxo
}
