import { useEffect } from 'react';
import { useSource, useTimeout } from '.';

export const useSourceTimer = <T>(
  source: () => Promise<T>,
  condition: (data: T) => boolean,
  timeout: number,
  deps: any[] = [],
): {
  data?: T;
  loading: boolean;
  error?: any;
  fetch: () => void;
  clear: () => void;
  clearError: () => void;
} => {
  const data = useSource(source, deps);
  const { seconds, reset } = useTimeout(timeout, true);

  useEffect(() => {
    if (data.data && condition(data.data)) {
      reset();
    }
  }, [data.data]);

  useEffect(() => {
    if (!seconds) {
      data.fetch();
    }
  }, [seconds, data.fetch]);

  return data;
};
