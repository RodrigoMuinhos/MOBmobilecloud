'use client';

export type Item = {
  nome: string;
  tipoSelecionado: string;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
};

export default function ItemRow({
  item, onChange, onRemove
}: { item: Item; onChange: (patch: Partial<Item>) => void; onRemove: () => void; }) {
  const subtotal = item.subtotal ?? (item.quantidade * item.precoUnitario);

  return (
    <div className="rounded-xl p-3 bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium text-black">{item.nome}</div>
        <button onClick={onRemove} className="text-red-600 text-sm">Remover</button>
      </div>
      <div className="text-gray-500 text-sm mb-2">Tipo: {item.tipoSelecionado}</div>
      <div className="grid grid-cols-3 gap-2">
        <input
          className="rounded-lg border px-2 py-1 text-black"
          value={String(item.quantidade)}
          onChange={(e) => onChange({ quantidade: Number(e.target.value || 0) })}
          placeholder="Qtd" type="number"
        />
        <input
          className="rounded-lg border px-2 py-1 text-black"
          value={String(item.precoUnitario)}
          onChange={(e) => onChange({ precoUnitario: Number(e.target.value || 0) })}
          placeholder="Preço" type="number" step="0.01"
        />
        <div className="flex items-center justify-end font-semibold text-black">
          R$ {subtotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
