import { useEffect } from 'react';

export const useEscape = (onEscape: () => void) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.keyCode === 27) onEscape();
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
};
