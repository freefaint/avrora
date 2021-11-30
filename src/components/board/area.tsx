import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

import html2canvas from 'html2canvas';

import { delay } from '@/fn';
import { minMax } from '@/smart';

interface AreaProps {
  Loader?: React.ReactNode;
  zoom: boolean;
  drag: boolean;
  cache?: boolean;
  scale: number;
  offsetX: number;
  offsetY: number;
  onInit: (scale: number, width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
  onScale?: (multiplier: number, cursorCenterOffsetX: number, cursorCenterOffsetY: number) => void;
}

export const Area = ({
  Loader,
  children,
  zoom,
  cache,
  drag,
  scale,
  offsetX,
  offsetY,
  onScale,
  onInit,
  onMove,
}: React.PropsWithChildren<AreaProps>) => {
  const [cacheImg, setCacheImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [moving, setMoving] = useState(false);
  const [dragged, setDragged] = useState(false);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const screenRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [contentWidth, setContentWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);

  const minX = useMemo(
    () => Math.min(-(contentWidth * scale - screenWidth) / 2, 0),
    [contentWidth, screenWidth, scale],
  );
  const maxX = useMemo(() => Math.max((contentWidth * scale - screenWidth) / 2, 0), [contentWidth, screenWidth, scale]);

  const minY = useMemo(
    () => Math.min(-(contentHeight * scale - screenHeight) / 2, 0),
    [contentHeight, screenHeight, scale],
  );
  const maxY = useMemo(
    () => Math.max((contentHeight * scale - screenHeight) / 2, 0),
    [contentHeight, screenHeight, scale],
  );

  const handleMouseMove = (e: any) => {
    if (dragged && drag) {
      const { movementX, movementY } = e;

      requestAnimationFrame(() => {
        onMove?.(minMax(movementX, minX - offsetX, maxX - offsetX), minMax(movementY, minY - offsetY, maxY - offsetY));
      });
    }
  };

  const handleMouseUp = () => {
    setMoving(false);
    setDragged(false);
  };

  const handleMouseDown = () => {
    if (drag) {
      setMoving(true);
      setDragged(true);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const { x, y, deltaX, deltaY, ctrlKey } = e;

    requestAnimationFrame(() => {
      setMoving(true);

      delay(turnOnTransition, 100);

      if (zoom && !ctrlKey) {
        return onScale?.(Math.pow(1.002, deltaY), x - screenWidth / 2, y - screenHeight / 2);
      }

      if (ctrlKey) {
        if (zoom) {
          return;
        }

        return onScale?.(Math.pow(1.004, -deltaY), x - screenWidth / 2, y - screenHeight / 2);
      }

      onMove?.(minMax(-deltaX, minX - offsetX, maxX - offsetX), minMax(-deltaY, minY - offsetY, maxY - offsetY));
    });
  };

  const turnOnTransition = useCallback(() => {
    setMoving(false);
  }, []);

  useEffect(() => {
    if (contentHeight && contentWidth) {
      onInit(Math.min(screenWidth / contentWidth, screenHeight / contentHeight, 1), screenWidth, screenHeight);
    }
  }, [screenWidth, screenHeight, contentWidth, contentHeight]);

  useEffect(() => {
    screenRef.current?.removeEventListener('mousedown', handleMouseDown);
    screenRef.current?.addEventListener('mousedown', handleMouseDown);
    screenRef.current?.removeEventListener('wheel', handleWheel);
    screenRef.current?.addEventListener('wheel', handleWheel);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      screenRef.current?.removeEventListener('mousedown', handleMouseDown);
      screenRef.current?.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scale, offsetX, offsetY, dragged, zoom]);

  useEffect(() => {
    if (contentRef.current && screenRef.current) {
      setTimeout(() => {
        if (cache) {
          const clone = document.createElement('div');

          const width = contentRef.current!.scrollWidth * 2;
          const height = contentRef.current!.scrollHeight * 2;

          clone.style.minWidth = width + 'px';
          clone.style.minHeight = height + 'px';

          setWidth(width);
          setHeight(height);

          clone.innerHTML = contentRef.current!.innerHTML;

          screenRef.current!.appendChild(clone);

          html2canvas(clone, {
            backgroundColor: 'transparent',
            allowTaint: true,
            useCORS: true,
          }).then((canvas) => {
            const data = canvas.toDataURL();

            setCacheImg(data);

            screenRef.current!.removeChild(clone);
            screenRef.current!.style.opacity = '1';

            setLoading(false);

            setContentWidth(contentRef.current!.scrollWidth * 2.5);
            setContentHeight(contentRef.current!.scrollHeight * 2.5);

            setScreenWidth(screenRef.current!.clientWidth);
            setScreenHeight(screenRef.current!.clientHeight);
          });
        } else {
          setLoading(false);

          setContentWidth(contentRef.current!.scrollWidth * 2.5);
          setContentHeight(contentRef.current!.scrollHeight * 2.5);

          setScreenWidth(screenRef.current!.clientWidth);
          setScreenHeight(screenRef.current!.clientHeight);
        }
      }, 100);
    }
  }, [contentRef, screenRef]);

  useEffect(() => {
    if (offsetX < minX || offsetX > maxX || offsetY < minY || offsetY > maxY) {
      onMove?.(
        offsetX < minX ? minX - offsetX : offsetX > maxX ? maxX - offsetX : 0,
        offsetY < minY ? minY - offsetY : offsetY > maxY ? maxY - offsetY : 0,
      );
    }
  }, [offsetX, offsetY, minX, maxX, minY, maxY]);

  return (
    <div
      ref={screenRef}
      style={{
        overflow: 'hidden',
        opacity: cache ? 0 : 1,
        flexDirection: 'column',
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        cursor: zoom ? 'zoom-in' : !drag ? 'default' : moving ? 'grabbing' : 'grab',
      }}
    >
      {!loading && cache && cacheImg && (
        <div
          style={{
            width: 0,
            height: 0,
            display: moving ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: !moving ? 'all 200ms ease-out' : 'none',
            transform: `translate(${offsetX ?? 0}px, ${offsetY ?? 0}px) scale(${scale ?? 1})`,
          }}
        >
          <img style={{ width, height }} src={cacheImg} />
        </div>
      )}

      {loading && Loader && (
        <div
          style={{
            width: 0,
            height: 0,
            display: cache && cacheImg && moving ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Loader}
        </div>
      )}

      {(!loading || !Loader) && (
        <div
          ref={contentRef}
          style={{
            width: 0,
            height: 0,
            display: cache && cacheImg && moving ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: !moving ? 'all 200ms ease-out' : 'none',
            transform: `translate(${offsetX ?? 0}px, ${offsetY ?? 0}px) scale(${scale ?? 1})`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
