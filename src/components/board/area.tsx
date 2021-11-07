import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

import { delay } from '@/fn';
import { minMax } from '@/smart';

interface AreaProps {
  scale: number;
  offsetX: number;
  offsetY: number;
  onInit: (scale: number, width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
  onScale?: (plus: boolean) => void;
}

export const Area = ({
  children,
  scale,
  offsetX,
  offsetY,
  onScale,
  onInit,
  onMove,
}: React.PropsWithChildren<AreaProps>) => {
  const [moving, setMoving] = useState(false);
  const [dragged, setDragged] = useState(false);

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
    if (dragged) {
      onMove?.(
        minMax(e.movementX, minX - offsetX, maxX - offsetX),
        minMax(e.movementY, minY - offsetY, maxY - offsetY),
      );
    }
  };

  const handleMouseUp = () => {
    setMoving(false);
    setDragged(false);
  };

  const handleMouseDown = () => {
    setMoving(true);
    setDragged(true);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    setMoving(true);

    delay(turnOnTransition, 100);

    if (e.ctrlKey) {
      return onScale?.(e.deltaY < 0);
    }

    onMove?.(minMax(-e.deltaX, minX - offsetX, maxX - offsetX), minMax(-e.deltaY, minY - offsetY, maxY - offsetY));
  };

  const turnOnTransition = useCallback(() => {
    setMoving(false);
  }, []);

  useEffect(() => {
    if (contentHeight && contentWidth) {
      onInit(Math.min(screenWidth / contentWidth, screenHeight / contentHeight), screenWidth, screenHeight);
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
  }, [scale, offsetX, offsetY, dragged]);

  useEffect(() => {
    if (contentRef.current && screenRef.current) {
      setTimeout(() => {
        setContentWidth(contentRef.current!.scrollWidth * 2.5);
        setContentHeight(contentRef.current!.scrollHeight * 2.5);

        setScreenWidth(screenRef.current!.clientWidth);
        setScreenHeight(screenRef.current!.clientHeight);
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
        flexDirection: 'column',
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        cursor: moving ? 'grabbing' : 'grab',
      }}
    >
      <div
        ref={contentRef}
        style={{
          width: 0,
          height: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: !moving ? 'all 200ms ease-out' : 'none',
          transform: `translate(${offsetX ?? 0}px, ${offsetY ?? 0}px) scale(${scale ?? 1})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
