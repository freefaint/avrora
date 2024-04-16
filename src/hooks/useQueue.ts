import { useCallback, useEffect, useState } from 'react';

export const useQueue = <T>() => {
  const [current, setCurrent] = useState<T>();
  const [queue, setQueue] = useState<T[]>([]);
  const [opened, setOpened] = useState(false);

  const push = useCallback((item: T) => {
    setQueue((items) => [...items, item]);
    setOpened(true);
  }, []);

  const next = useCallback(() => {
    setOpened(false);
  }, []);

  useEffect(() => {
    if (current && !opened) {
      const timer = setTimeout(() => {
        setCurrent(queue[0]);
        setQueue(queue.slice(1));
      }, 200);

      return () => {
        clearTimeout(timer);
      };
    }

    if (!current && opened) {
      setCurrent(queue[0]);
      setQueue(queue.slice(1));

      return;
    }

    return;
  }, [current, queue, opened]);

  return {
    current,
    opened,
    push,
    next,
  };
};
