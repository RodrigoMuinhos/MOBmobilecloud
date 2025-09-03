// frontend/src/components/responsive/OnlyMobile.tsx
export const OnlyMobile: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="block md:hidden">{children}</div>
);