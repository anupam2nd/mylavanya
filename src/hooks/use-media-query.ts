
import { useState, useEffect } from 'react';

/**
 * Custom hook to check if the current viewport matches the provided media query
 * @param query Media query string to match against
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set the initial value
    setMatches(media.matches);
    
    // Define a callback function to handle changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add the callback as a listener for changes to the media query
    media.addEventListener('change', listener);
    
    // Clean up when component unmounts
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}
