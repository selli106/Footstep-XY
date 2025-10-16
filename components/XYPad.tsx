import React, { useState, useRef, useEffect, useCallback } from 'react';
// Fix: 'AxisMode' was imported as a type but used as a value. Changed 'import type' to 'import'.
import { AxisMode } from '../types';

interface XYPadProps {
  xy: { x: number; y: number };
  setXY: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  axisMode: AxisMode;
  onPadInteractionStart: (position: { x: number; y: number }) => void;
}

const XYPad: React.FC<XYPadProps> = ({ xy, setXY, axisMode, onPadInteractionStart }) => {
  const [isDragging, setIsDragging] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    if (!padRef.current) return { x: 0, y: 0 };

    e.preventDefault();
    const rect = padRef.current.getBoundingClientRect();
    const touch = 'touches' in e ? e.touches[0] : e;

    let x = (touch.clientX - rect.left) / rect.width;
    let y = (touch.clientY - rect.top) / rect.height;

    // Clamp values between 0 and 1
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    const newPosition = { x, y };
    setXY(newPosition);
    return newPosition;
  }, [setXY]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const newPosition = handleInteraction(e);
    onPadInteractionStart(newPosition);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const newPosition = handleInteraction(e);
    onPadInteractionStart(newPosition);
  };
  
  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleInteraction(e as any);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleInteraction(e as any);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', stopDragging);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging, handleInteraction, stopDragging]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!padRef.current || document.activeElement !== padRef.current) return;

      e.preventDefault();
      const step = e.shiftKey ? 0.05 : 0.01;
      
      setXY(prev => {
        let newX = prev.x;
        let newY = prev.y;
        if (e.key === 'ArrowUp') newY -= step;
        if (e.key === 'ArrowDown') newY += step;
        if (e.key === 'ArrowLeft') newX -= step;
        if (e.key === 'ArrowRight') newX += step;
        
        return {
          x: Math.max(0, Math.min(1, newX)),
          y: Math.max(0, Math.min(1, newY)),
        };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setXY]);

  const getLabels = () => {
    if (axisMode === AxisMode.PAN) {
      return { top: 'Sound 1', bottom: 'Sound 2', left: 'Pan Left', right: 'Pan Right' };
    }
    return { top: 'Top', bottom: 'Bottom', left: 'Left', right: 'Right' };
  };

  const labels = getLabels();

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex justify-between text-gray-400 font-semibold px-2">
        <span>{labels.left}</span>
        <span>{labels.right}</span>
      </div>
      <div className="flex items-center w-full max-w-md">
        <div className="flex flex-col justify-between h-72 md:h-96 text-gray-400 font-semibold py-2 -mr-2">
          <span>{labels.top}</span>
          <span>{labels.bottom}</span>
        </div>
        <div
          ref={padRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative w-full h-72 md:h-96 bg-gray-800/50 rounded-lg shadow-inner cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
          style={{ touchAction: 'none' }}
          tabIndex={0}
        >
          <div
            className="absolute w-6 h-6 bg-cyan-400 rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out"
            style={{ left: `${xy.x * 100}%`, top: `${xy.y * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default XYPad;