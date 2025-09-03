'use client';
import React, { useMemo } from 'react';
import { BsCircleFill } from 'react-icons/bs';

export const cores = ['azul', 'verde', 'amarelo', 'vermelho', 'roxo', 'cinza'] as const;
export type CorStatus = typeof cores[number];

const classesCor: Record<CorStatus, string> = {
  azul: 'text-blue-500',
  verde: 'text-green-500',
  amarelo: 'text-yellow-400',
  vermelho: 'text-red-500',
  roxo: 'text-purple-500',
  cinza: 'text-gray-400',
};

type Props = {
  /** contagem por cor */
  contador: Partial<Record<CorStatus, number>>;
  /** cor atualmente filtrada (opcional) */
  ativo?: CorStatus | null;
  /** callback ao clicar numa cor (opcional) */
  onClickCor?: (cor: CorStatus) => void;
  /** classes extras (opcional) */
  className?: string;
  /** exibir total ao lado (default: true) */
  mostrarTotal?: boolean;
  /** labels opcionais por cor (para i18n/tooltips) */
  labels?: Partial<Record<CorStatus, string>>;
};

const ContadorPorStatus: React.FC<Props> = ({
  contador,
  ativo = null,
  onClickCor,
  className = '',
  mostrarTotal = true,
  labels = {},
}) => {
  const total = useMemo(
    () => (Object.values(contador) as number[]).reduce((s, n) => s + (n || 0), 0),
    [contador]
  );

  return (
    <div className={`flex flex-wrap items-center gap-4 mb-4 ${className}`}>
      {cores.map((cor) => {
        const count = contador[cor] ?? 0;
        const isActive = ativo === cor;
        const label = labels[cor] ?? cor;

        const Btn = onClickCor ? 'button' : ('div' as any);

        return (
          <Btn
            key={cor}
            type={onClickCor ? 'button' : undefined}
            onClick={onClickCor ? () => onClickCor(cor) : undefined}
            className={`flex items-center gap-1 ${
              onClickCor ? 'cursor-pointer' : ''
            } ${isActive ? 'font-semibold scale-105' : ''}`}
            aria-label={`Status ${label}: ${count}`}
            aria-pressed={onClickCor ? isActive : undefined}
            title={`${label}: ${count}`}
          >
            <BsCircleFill className={classesCor[cor]} size={14} />
            <span className="text-sm">{count}</span>
          </Btn>
        );
      })}

      {mostrarTotal && (
        <div className="text-xs opacity-70 ml-2">
          Total: {total}
        </div>
      )}
    </div>
  );
};

export default ContadorPorStatus;
