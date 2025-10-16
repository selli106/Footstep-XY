// Fix: The original content of App.tsx was invalid. It has been replaced with a functional React component that serves as the application's root.
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import XYPad from './components/XYPad';
import Controls from './components/Controls';
import Footer from './components/Footer';
import { useAudioEngine } from './hooks/useAudioEngine';
import { AxisMode, type SoundSources, type SoundCorner } from './types';

const initialSounds: SoundSources = {
  topLeft: { url: null, volume: 0.75, name: null },
  topRight: { url: null, volume: 0.75, name: null },
  bottomLeft: { url: null, volume: 0.75, name: null },
  bottomRight: { url: null, volume: 0.75, name: null },
};

function App() {
  const [xy, setXY] = useState({ x: 0.5, y: 0.5 });
  const [axisMode, setAxisMode] = useState<AxisMode>(AxisMode.BLEND);
  const [soundSources, setSoundSources] = useState<SoundSources>(initialSounds);
  const { initAudioContext, isInitialized, triggerSound } = useAudioEngine(soundSources);
  const [panOffset, setPanOffset] = useState(0);

  const setSoundSource = useCallback((corner: SoundCorner, file: File) => {
    const url = URL.createObjectURL(file);
    setSoundSources(prev => {
      // Revoke old URL if it exists to prevent memory leaks
      if (prev[corner].url) {
        URL.revokeObjectURL(prev[corner].url!);
      }
      return {
        ...prev,
        [corner]: { ...prev[corner], url, name: file.name },
      };
    });
  }, []);

  const setSoundSourceVolume = useCallback((corner: SoundCorner, volume: number) => {
    setSoundSources(prev => ({
      ...prev,
      [corner]: { ...prev[corner], volume },
    }));
  }, []);

  const handlePadInteractionStart = useCallback((position: { x: number; y: number }) => {
    if (!isInitialized) {
      initAudioContext();
    }
    // We trigger the sound immediately on interaction start (click/touch)
    triggerSound(position, axisMode, panOffset);
  }, [isInitialized, initAudioContext, triggerSound, axisMode, panOffset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handlePadInteractionStart(xy);
      }
      if (e.key === 'Alt') {
        e.preventDefault();
        if (panOffset !== -0.5) setPanOffset(-0.5);
      }
      if (e.key === 'Shift') {
        e.preventDefault();
        if (panOffset !== 0.5) setPanOffset(0.5);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.key === 'Shift') {
        setPanOffset(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [xy, handlePadInteractionStart, panOffset]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(soundSources).forEach(source => {
        if (source.url) {
          URL.revokeObjectURL(source.url);
        }
      });
    };
  }, [soundSources]);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 lg:gap-12">
        
          {/* Left Column: XY Pad + Readout */}
          <div className="w-full lg:w-1/2 flex flex-col">
            {/* This container grows to match the Controls panel's height, and centers the pad within it. */}
            <div className="flex-grow flex items-center justify-center min-h-0">
              <XYPad 
                xy={xy} 
                setXY={setXY} 
                axisMode={axisMode} 
                onPadInteractionStart={handlePadInteractionStart} 
              />
            </div>
            {/* Readout is outside the growing container, at the bottom of the column */}
            <div className="mt-4 text-center text-gray-400">
              <p>X: {xy.x.toFixed(2)}, Y: {xy.y.toFixed(2)}</p>
              <p className="text-sm mt-2">Click/drag, use arrow keys, or press Space to play.</p>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="w-full lg:w-1/2 flex justify-center">
             <Controls
              axisMode={axisMode}
              setAxisMode={setAxisMode}
              soundSources={soundSources}
              setSoundSource={setSoundSource}
              setSoundSourceVolume={setSoundSourceVolume}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;