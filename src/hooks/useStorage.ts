import { useCallback, useState } from 'react';

export const useStorage = <T>(name: string, val?: T): [T, (item: T) => void] => {
  const get = useCallback(() => {
    let val;

    try {
      val = JSON.parse(localStorage.getItem(name) ?? 'null');
    } catch {
      val = null;
    }

    return val;
  }, []);

  const [value, setValue] = useState<T>(get() ?? val);

  const set = useCallback((val: T) => {
    localStorage.setItem(name, JSON.stringify(val));
    setValue(val);
  }, []);

  return [value, set];
};
