import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import XYPad from './components/XYPad';
import Controls from './components/Controls';
import { useAudioEngine } from './hooks/useAudioEngine';
import { AxisMode } from './types';
import type { SoundSources, SoundCorner } from './types';

const InitialOverlay: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
        <div className="text-center p-8">
            <h2 className="text-3xl font-bold text-white mb-4">Interactive Soundscape Creator</h2>
            <p className="text-gray-300 mb-8 max-w-lg">
                Upload your own audio files, then click the XY Pad to play and blend them into a unique soundscape.
                This experience requires audio. Click below to start.
            </p>
            <button
                onClick={onStart}
                className="bg-cyan-500 text-white font-bold py-3 px-10 rounded-full hover:bg-cyan-600 transition-colors duration-300 text-lg transform hover:scale-105"
            >
                Start Experience
            </button>
        </div>
    </div>
);

function App() {
  const [xy, setXY] = useState({ x: 0.5, y: 0.5 });
  const [axisMode, setAxisMode] = useState<AxisMode>(AxisMode.BLEND);
  const [soundSources, setSoundSources] = useState<SoundSources>({
    topLeft: { url: null, volume: 1, name: null },
    topRight: { url: null, volume: 1, name: null },
    bottomLeft: { url: null, volume: 1, name: null },
    bottomRight: { url: null, volume: 1, name: null },
  });

  const { initAudioContext, isInitialized, triggerSound } = useAudioEngine(soundSources);
  
  const handleStart = () => {
    initAudioContext();
  };
  
  const setSoundSource = useCallback((corner: SoundCorner, file: File) => {
    setSoundSources(prev => {
      const oldUrl = prev[corner].url;
      if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
      }
      const newUrl = URL.createObjectURL(file);
      return { 
        ...prev, 
        [corner]: { ...prev[corner], url: newUrl, name: file.name }
      };
    });
  }, []);

  const setSoundSourceVolume = useCallback((corner: SoundCorner, volume: number) => {
    setSoundSources(prev => ({
      ...prev,
      [corner]: { ...prev[corner], volume: volume }
    }));
  }, []);

  const handlePadInteractionStart = (position: { x: number; y: number }) => {
    triggerSound(position, axisMode, 0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        
        // Use a significant pan offset for a clear effect
        const PAN_OFFSET = 0.75; 
        let panOffset = 0;
        
        if (e.altKey) { // Pan left with Alt
          panOffset = -PAN_OFFSET;
        } else if (e.shiftKey) {
          panOffset = PAN_OFFSET; // Pan right
        }
        
        triggerSound(xy, axisMode, panOffset);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [xy, axisMode, triggerSound, isInitialized]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
      {!isInitialized && <InitialOverlay onStart={handleStart} />}
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 w-full max-w-6xl">
          <div className="w-full lg:w-2/3 flex-shrink-0">
            <XYPad
              xy={xy}
              setXY={setXY}
              axisMode={axisMode}
              onPadInteractionStart={handlePadInteractionStart}
            />
          </div>
          <div className="w-full lg:w-1/3 flex-shrink-0 lg:mt-16">
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