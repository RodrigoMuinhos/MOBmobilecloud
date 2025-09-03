// frontend/src/hooks/useBreakpoint.ts
import { useEffect, useState } from 'react';

export function useBreakpoint(minWidthPx: number = 768) { // 768 ~ md
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= minWidthPx;
  });

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= minWidthPx);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [minWidthPx]);

  return isDesktop;
}
