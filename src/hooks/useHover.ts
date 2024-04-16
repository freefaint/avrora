import { useCallback, useEffect, useRef, useState } from 'react';

export const useHover = () => {
  const ref = useRef<any>(null);
  const [hover, setHover] = useState(false);

  const mouseOver = useCallback(() => {
    setHover(true);
  }, []);

  const mouseOut = useCallback(() => {
    setHover(false);
  }, []);

  useEffect(() => {
    ref.current?.addEventListener('mouseover', mouseOver);
    ref.current?.addEventListener('mouseout', mouseOut);

    return () => {
      ref.current?.removeEventListener('mouseover', mouseOver);
      ref.current?.removeEventListener('mouseout', mouseOut);
    };
  }, [ref]);

  return { ref, hover };
};
