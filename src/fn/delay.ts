const waiters: Array<() => void | string> = [];
const timers: number[] = [];
const DEFAULT = 1000;

const place = <T>(item: T, list: T[]) => {
  const i = list.indexOf(item);

  if (i !== -1) {
    return i;
  }

  return list.push(item) - 1;
};

export const delay = (fn: (...params: any) => void, time: number = DEFAULT, params?: any[], name?: string) => {
  const i = place(name ?? fn, waiters);

  if (timers[i]) {
    clearTimeout(timers[i]);
  }

  timers[i] = window.setTimeout(params ? () => fn(...params) : fn, time !== undefined ? time : DEFAULT);
};

export const cancel = (fn: () => void | string) => {
  const i = waiters.indexOf(fn);

  if (i !== -1) {
    clearTimeout(timers[i]);
  }
};
