// frontend/src/components/responsive/OnlyDesktop.tsx
export const OnlyDesktop: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="hidden md:block">{children}</div>
  );