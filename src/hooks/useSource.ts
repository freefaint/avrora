import { useCallback, useEffect, useState } from 'react';

export const useSource = <T>(
  source: () => Promise<T>,
  deps: any[] = [],
): {
  data?: T;
  loading: boolean;
  error?: any;
  fetch: () => void;
  clear: () => void;
  clearError: () => void;
} => {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(undefined);
    // setData(undefined);

    source()
      .then((resp) => setData(resp))
      .catch((resp) => setError(resp))
      .finally(() => setLoading(false));
  }, [source]);

  const clear = useCallback(() => setData(undefined), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fetch, deps);

  return { data, loading, error, fetch, clear, clearError: () => setError(undefined) };
};
