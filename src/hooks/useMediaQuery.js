import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  // Inicializamos directamente con el valor actual del media query para evitar parpadeos
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Navaja suiza directa para usar en los componentes contenedores
export function useIsDesktop() {
  // Tailwind lg = 1024px.
  // true = Escritorio (lg, xl, 2xl)
  // false = Móvil/Tablet (xs, sm, md)
  return useMediaQuery('(min-width: 1024px)');
}