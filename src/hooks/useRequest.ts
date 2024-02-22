import { useCallback, useEffect, useState } from 'react';

interface IProps<T> {
  query: (...data: any[]) => Promise<T>;
  lazy?: boolean;
}

export const useRequest = <T>({ query, lazy }: IProps<T>) => {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState(false);

  const clear = useCallback(() => {
    setData(undefined);
    setError(undefined);
  }, []);

  const fetch = useCallback(
    (...args: any[]) => {
      clear();
      setLoading(true);

      return query(...args)
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    },
    [query, clear],
  );

  useEffect(() => {
    if (!lazy) {
      fetch();
    }
  }, [lazy, fetch]);

  return { fetch, error, loading, clear, data };
};
