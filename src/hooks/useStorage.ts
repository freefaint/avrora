import { Dispatch, SetStateAction, useCallback, useState } from 'react';

export const useStorage = <T>(name: string, val?: T): [T, Dispatch<SetStateAction<T>>] => {
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

  const set: Dispatch<SetStateAction<T>> = useCallback(val => {
    if (val instanceof Function) {
      setValue(old => {
        const newVal = val(old);
        localStorage.setItem(name, JSON.stringify(newVal));
        return newVal;
      });
    } else {
      localStorage.setItem(name, JSON.stringify(val));
      setValue(val);
    }
  }, []);

  return [value, set];
};
