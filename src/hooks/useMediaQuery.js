import { useState, useEffect } from 'react';

// Hook to detect when a CSS media query matches (for responsive design)
export const useMediaQuery = (query) => {
  // Initialize with null to avoid hydration mismatch
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') return;

    // Create the media query list
    const mediaQuery = window.matchMedia(query);

    // Set the initial value
    setMatches(mediaQuery.matches);

    // Define the handler function
    const handler = (event) => {
      setMatches(event.matches);
    };

    // Add the event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
