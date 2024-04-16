import { createContext } from 'react';
import { DialogContextProps } from './types';

export const DialogContext = createContext<DialogContextProps>({
  push: () => void 0,
});
