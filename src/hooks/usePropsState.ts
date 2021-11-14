import { useCallback, useEffect, useState } from 'react';

export const usePropsState = <T>(initial: T) => {
  const [value, setValue] = useState<T>(initial);

  const reset = useCallback(() => {
    setValue(initial);
  }, [initial]);

  useEffect(() => {
    setValue(current => (current === initial ? current : initial));
  }, [initial]);

  return { value, set: setValue, reset };
};
