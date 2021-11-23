import { createContext } from 'react';

import { BoardOperations } from './types';

interface BoardState {
  percent: string;
  minScale: boolean;
  map: boolean;
  zoom: boolean;
  drag: boolean;
}

export const BoardContext = createContext<(BoardState & BoardOperations) | null>(null);
