
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const updateMatches = () => {
      setMatches(mediaQuery.matches);
    };
    
    // Set initial value
    updateMatches();
    
    // Add listener for changes
    mediaQuery.addEventListener('change', updateMatches);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', updateMatches);
    };
  }, [query]);
  
  return matches;
}

// Predefined media queries
export const useIsMobile = () => useMediaQuery('(max-width: 640px)');
export const useIsTablet = () => useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');
