import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function useBuscaClientes(termo: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!termo?.trim()) { setData([]); return; }
      setLoading(true);
      try {
        const { data } = await api.get('/clientes', { params: { busca: termo, limit: 10 } });
        setData(data);
      } finally { setLoading(false); }
    }, 300); // debounce
    return () => clearTimeout(t);
  }, [termo]);

  return { data, loading };
}

export function useBuscaProdutos(termo: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!termo?.trim()) { setData([]); return; }
      setLoading(true);
      try {
        // ajuste o endpoint conforme seu backend (ProdutoEstoque)
        const { data } = await api.get('/produtos-estoque', { params: { busca: termo, limit: 10 } });
        setData(data);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [termo]);

  return { data, loading };
}
