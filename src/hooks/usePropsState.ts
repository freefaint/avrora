import { useCallback, useEffect, useState } from 'react';

export const usePropsState = <T>(initial: T, ignore?: boolean) => {
  const [value, setValue] = useState<T>(initial);

  const reset = useCallback(() => {
    setValue(initial);
  }, [initial]);

  useEffect(() => {
    if (!ignore) {
      setValue((current) => (current === initial ? current : initial));
    }
  }, [initial, ignore]);

  return { value, set: setValue, reset };
};
