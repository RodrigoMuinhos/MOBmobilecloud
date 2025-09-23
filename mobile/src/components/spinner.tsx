'use client';

type Props = {
  size?: number;          // px
  stroke?: number;        // espessura da borda
  color?: string;         // cor do traço ativo
  track?: string;         // cor da trilha
  className?: string;
};

export default function Spinner({
  size = 48,
  stroke = 4,
  color = '#F15A24',      // laranja destaque
  track = 'rgba(0,0,0,0.2)',
  className = '',
}: Props) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderWidth: stroke,
    borderTopColor: color,
    borderRightColor: track,
    borderBottomColor: track,
    borderLeftColor: track,
  };
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full animate-spin ${className}`}
      style={{ ...style, borderStyle: 'solid' }}
    />
  );
}
