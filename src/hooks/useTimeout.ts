import { useCallback, useEffect, useReducer } from 'react';

function reducer(state: { seconds: number; running: boolean }, action: { type: 'RESET' | 'MINUS'; number?: number }) {
  const seconds = action.type === 'RESET' ? action.number! : state.seconds - 1;
  const running = seconds > 0;

  return { seconds, running };
}

export const useTimeout = (initSeconds: number = 0, lazy?: boolean) => {
  const [state, dispatch] = useReducer(reducer, { seconds: initSeconds ?? 0, running: !!initSeconds && !lazy });

  const reset = useCallback(
    (resetSeconds?: number) => {
      dispatch({ type: 'RESET', number: resetSeconds ?? initSeconds ?? 0 });
    },
    [initSeconds],
  );

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (state.running) {
      intervalId = setInterval(() => {
        dispatch({ type: 'MINUS' });
      }, 1000);
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.running]);

  return { ...state, reset };
};
