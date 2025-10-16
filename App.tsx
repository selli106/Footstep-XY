import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from './components/Header';
import XYPad from './components/XYPad';
import Controls from './components/Controls';
import Footer from './components/Footer';
import { useAudioEngine } from './hooks/useAudioEngine';
import type { SoundSources, AxisMode, SoundCorner, ReverbPreset } from './types';
import { AxisMode as AxisModeEnum } from './types';

const initialSoundSources: SoundSources = {
  topLeft: { url: null, file: null, volume: 1.0, name: null },
  topRight: { url: null, file: null, volume: 1.0, name: null },
  bottomLeft: { url: null, file: null, volume: 1.0, name: null },
  bottomRight: { url: null, file: null, volume: 1.0, name: null },
};

function App() {
  const [xy, setXY] = useState({ x: 0.5, y: 0.5 });
  const [axisMode, setAxisMode] = useState<AxisMode>(AxisModeEnum.BLEND);
  const [soundSources, setSoundSources] = useState<SoundSources>(initialSoundSources);
  const [reverbPreset, setReverbPreset] = useState<ReverbPreset>('none');
  const [reverbWet, setReverbWet] = useState(0.3);
  const [keysPressed, setKeysPressed] = useState({ alt: false, shift: false });

  const { initAudioContext, isInitialized, triggerSound } = useAudioEngine(soundSources, reverbPreset, reverbWet);

  const handleSetSoundSource = useCallback((corner: SoundCorner, file: File) => {
    setSoundSources(prev => ({
      ...prev,
      [corner]: { ...prev[corner], file, name: file.name }
    }));
  }, []);

  const handleSetSoundSourceVolume = useCallback((corner: SoundCorner, volume: number) => {
    setSoundSources(prev => ({
      ...prev,
      [corner]: { ...prev[corner], volume }
    }));
  }, []);

  const handlePadInteractionStart = useCallback(async (position: { x: number; y: number }) => {
    if (!isInitialized) {
      await initAudioContext();
    }
    triggerSound(position, axisMode);
  }, [isInitialized, initAudioContext, triggerSound, axisMode]);

  // Effect to track Alt/Shift key state for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        e.preventDefault();
        setKeysPressed(p => ({ ...p, alt: true }));
      }
      if (e.key === 'Shift') {
        setKeysPressed(p => ({ ...p, shift: true }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        e.preventDefault();
        setKeysPressed(p => ({ ...p, alt: false }));
      }
      if (e.key === 'Shift') {
        setKeysPressed(p => ({ ...p, shift: false }));
      }
    };
    
    // Reset keys if the user tabs away
    const handleBlur = () => {
      setKeysPressed({ alt: false, shift: false });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Derive panOffset from the state of pressed keys
  const panOffset = useMemo(() => {
    if (keysPressed.alt) return -0.75;
    if (keysPressed.shift) return 0.75;
    return 0;
  }, [keysPressed]);

  // Effect for handling the spacebar press
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        
        if (!isInitialized) {
          await initAudioContext();
        }
        
        // Use the reliable panOffset from our derived state
        triggerSound(xy, axisMode, panOffset);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [xy, axisMode, panOffset, triggerSound, isInitialized, initAudioContext]);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <XYPad 
              xy={xy} 
              setXY={setXY} 
              axisMode={axisMode} 
              onPadInteractionStart={handlePadInteractionStart} 
            />
          </div>
          <div className="lg:col-span-1">
            <Controls 
              axisMode={axisMode}
              setAxisMode={setAxisMode}
              soundSources={soundSources}
              setSoundSource={handleSetSoundSource}
              setSoundSourceVolume={handleSetSoundSourceVolume}
              reverbPreset={reverbPreset}
              setReverbPreset={setReverbPreset}
              reverbWet={reverbWet}
              setReverbWet={setReverbWet}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;