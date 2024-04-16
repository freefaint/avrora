import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

export const useDelayedValue = <T>(
  initialValue: T,
  delay: number
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(initialValue);

  const actual = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(actual, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [actual]);

  return [value, setValue];
};
