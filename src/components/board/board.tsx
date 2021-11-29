import React, { useCallback, useState, useMemo, FC } from 'react';
import { minMax } from '@/smart';

import { Area } from '@/components/board/area';

import { BoardContext } from './context';

export interface BoardProps {
  fitOnCursorPositionWhenZoom?: boolean;
  useScreenshotWhileMoving?: boolean;
  Toolbar?: FC;
  mapNode?: React.ReactNode;
}

export const Board = ({
  Toolbar,
  fitOnCursorPositionWhenZoom,
  useScreenshotWhileMoving,
  mapNode,
  children,
}: React.PropsWithChildren<BoardProps>) => {
  const [zoom, setZoom] = useState(false);
  const [drag, setDrag] = useState(false);
  const [map, setMap] = useState(true);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [scale, setScale] = useState(1);
  const [startScale, setStartScale] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const handleInit = useCallback(
    (scale, width, height) => {
      setWidth(width);
      setHeight(height);
      setScale(scale);
      setStartScale(scale);
    },
    [scale],
  );

  const handleScale = useCallback(
    (multiplier: number, cursorCenterOffsetX: number, cursorCenterOffsetY: number) => {
      setOffsetX(
        (x) =>
          x * multiplier - (fitOnCursorPositionWhenZoom ? cursorCenterOffsetX * multiplier - cursorCenterOffsetX : 0),
      );
      setOffsetY(
        (y) =>
          y * multiplier - (fitOnCursorPositionWhenZoom ? cursorCenterOffsetY * multiplier - cursorCenterOffsetY : 0),
      );
      setScale(Math.max(scale * multiplier, startScale));
    },
    [setScale, scale, startScale],
  );

  const handlePlus = useCallback(() => {
    handleScale(1.25, 0, 0);
  }, [scale]);

  const handleMinus = useCallback(() => {
    handleScale(0.75, 0, 0);
  }, [scale, startScale]);

  const handleFit = useCallback(() => {
    setScale(startScale);
    setOffsetX(0);
    setOffsetY(0);
  }, [startScale]);

  const handleOriginal = useCallback(() => {
    setScale(1);
  }, [scale]);

  const handleMove = useCallback(
    (x: number, y: number) => {
      setOffsetX((offsetX) => offsetX + x);
      setOffsetY((offsetY) => offsetY + y);
    },
    [scale],
  );

  const mapWidth = useMemo(() => width / 10, [width]);
  const mapHeight = useMemo(() => height / 10, [height]);

  const multiplier = useMemo(() => (startScale ?? 0) / (scale || 1), [startScale, scale]);

  const blockWidth = useMemo(() => mapWidth * multiplier, [mapWidth, multiplier]);
  const blockHeight = useMemo(() => mapHeight * multiplier, [mapHeight, multiplier]);

  const blockRight = useMemo(
    () => (mapWidth - blockWidth) / 2 + (offsetX / 10) * multiplier,
    [mapWidth, blockWidth, offsetX, multiplier],
  );
  const blockBottom = useMemo(
    () => (mapHeight - blockHeight) / 2 + (offsetY / 10) * multiplier,
    [mapHeight, blockHeight, offsetY, multiplier],
  );

  const handleMap = useCallback(
    (e: React.MouseEvent) => {
      const x = e.nativeEvent.offsetX - mapWidth / 2;
      const y = e.nativeEvent.offsetY - mapHeight / 2;

      const minX = -(mapWidth - blockWidth) / 2;
      const maxX = (mapWidth - blockWidth) / 2;

      const minY = -(mapHeight - blockHeight) / 2;
      const maxY = (mapHeight - blockHeight) / 2;

      setOffsetX((minMax(-x, minX, maxX) * 10) / multiplier);
      setOffsetY((minMax(-y, minY, maxY) * 10) / multiplier);
    },
    [mapWidth, mapHeight, blockWidth, blockHeight, multiplier],
  );

  return (
    <BoardContext.Provider
      value={{
        percent: `${Math.ceil(scale * 100)} %`,
        map,
        zoom,
        drag,
        minScale: scale === startScale,
        handleFit,
        handleMinus,
        handlePlus,
        handleOriginal,
        handleToggleMap: () => setMap((bool) => !bool),
        handleToggleZoom: () => setZoom((bool) => !bool),
        handleToggleDrag: () => setDrag((bool) => !bool),
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          height: '100%',
          backgroundColor: '#f2f6fa',
        }}
      >
        {Toolbar && (
          <div
            style={{
              boxSizing: 'border-box',
              position: 'absolute',
              display: 'flex',
              width: '100%',
              zIndex: 1,
              justifyContent: 'space-between',
            }}
          >
            <Toolbar />
          </div>
        )}

        {map && (
          <div
            style={{
              position: 'fixed',
              right: '16px',
              bottom: '16px',
              zIndex: 1,
              width: `${mapWidth}px`,
              height: `${mapHeight}px`,
              border: '1px solid rgba(0,0,0,0.16)',
              background: 'rgba(0,0,0,0.04)',
            }}
            onClick={handleMap}
          >
            <div
              style={{
                pointerEvents: 'none',
                position: 'fixed',
                transition: 'all 200ms ease-out',
                right: `${16 + blockRight}px`,
                bottom: `${16 + blockBottom}px`,
                zIndex: 1,
                width: `${blockWidth}px`,
                height: `${blockHeight}px`,
                border: '1px solid rgba(0,0,160,0.16)',
                background: 'rgba(0,0,160,0.08)',
              }}
            />

            <div
              style={{
                pointerEvents: 'none',
                position: 'fixed',
                zIndex: 1,
                width: 0,
                height: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                right: `${16 + mapWidth / 2}px`,
                bottom: `${16 + mapHeight / 2}px`,
                opacity: 0.5,
                transform: `scale(${startScale / 10})`,
              }}
            >
              {mapNode ?? children}
            </div>
          </div>
        )}

        <Area
          cache={useScreenshotWhileMoving}
          zoom={zoom}
          drag={drag}
          scale={scale}
          offsetX={offsetX}
          offsetY={offsetY}
          onScale={handleScale}
          onInit={handleInit}
          onMove={handleMove}
        >
          {children}
        </Area>
      </div>
    </BoardContext.Provider>
  );
};
