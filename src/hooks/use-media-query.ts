
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      setMatches(media.matches);
      
      // Add listener for changes
      const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
      media.addEventListener('change', listener);
      
      // Cleanup
      return () => media.removeEventListener('change', listener);
    }
    
    return undefined;
  }, [query]);

  return matches;
};
