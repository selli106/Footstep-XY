import React, { useRef } from 'react';
import { AxisMode } from '../types';
import type { SoundSources, SoundCorner, SoundSource } from '../types';

interface ControlsProps {
  axisMode: AxisMode;
  setAxisMode: (mode: AxisMode) => void;
  soundSources: SoundSources;
  setSoundSource: (corner: SoundCorner, file: File) => void;
  setSoundSourceVolume: (corner: SoundCorner, volume: number) => void;
}

const AudioFileInput: React.FC<{
  label: string;
  corner: SoundCorner;
  soundSource: SoundSource;
  setSoundSource: (corner: SoundCorner, file: File) => void;
  onVolumeChange: (corner: SoundCorner, volume: number) => void;
}> = ({ label, corner, soundSource, setSoundSource, onVolumeChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { name: soundName, volume } = soundSource;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSoundSource(corner, file);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col space-y-2">
      <span className="text-sm font-semibold text-gray-300 mb-1">{label}</span>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="audio/*"
      />
      <button
        onClick={handleButtonClick}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 truncate"
        title={soundName || 'Select a file'}
      >
        {soundName || 'Select Audio'}
      </button>
      {soundName && (
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(corner, parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            aria-label={`${label} volume`}
          />
          <span className="text-xs text-gray-400 w-10 text-center">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

const Controls: React.FC<ControlsProps> = ({ axisMode, setAxisMode, soundSources, setSoundSource, setSoundSourceVolume }) => {
  return (
    <div className="w-full max-w-md bg-gray-800/50 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-white">Controls</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-2">Axis Mode</label>
        <div className="flex bg-gray-900 rounded-md p-1">
          <button
            onClick={() => setAxisMode(AxisMode.BLEND)}
            className={`w-1/2 py-2 text-sm font-semibold rounded ${axisMode === AxisMode.BLEND ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            4-Sound Blend
          </button>
          <button
            onClick={() => setAxisMode(AxisMode.PAN)}
            className={`w-1/2 py-2 text-sm font-semibold rounded ${axisMode === AxisMode.PAN ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            2-Sound Pan
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-2">Sound Sources</label>
        {axisMode === AxisMode.BLEND ? (
          <div className="grid grid-cols-2 gap-4">
            <AudioFileInput label="Top-Left" corner="topLeft" soundSource={soundSources.topLeft} setSoundSource={setSoundSource} onVolumeChange={setSoundSourceVolume} />
            <AudioFileInput label="Top-Right" corner="topRight" soundSource={soundSources.topRight} setSoundSource={setSoundSource} onVolumeChange={setSoundSourceVolume} />
            <AudioFileInput label="Bottom-Left" corner="bottomLeft" soundSource={soundSources.bottomLeft} setSoundSource={setSoundSource} onVolumeChange={setSoundSourceVolume} />
            <AudioFileInput label="Bottom-Right" corner="bottomRight" soundSource={soundSources.bottomRight} setSoundSource={setSoundSource} onVolumeChange={setSoundSourceVolume} />
          </div>
        ) : (
           <div className="grid grid-cols-1 gap-4">
            <AudioFileInput label="Sound 1 (Top)" corner="topLeft" soundSource={soundSources.topLeft} setSoundSource={setSoundSource} onVolumeChange={setSoundSourceVolume} />
            <AudioFileInput label="Sound 2 (Bottom)" corner="bottomLeft" soundSource={soundSources.bottomLeft} setSoundSource={setSoundSource} onVolumeChange={setSoundSourceVolume} />
            <div className="text-xs text-gray-400 text-center col-span-1 pt-2">
                Top-Right and Bottom-Right sounds are unused in Pan mode.
            </div>
           </div>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-gray-900/50 rounded-md">
        <p className="text-sm text-gray-300">
          <span className="font-bold text-cyan-400">Pro Tip:</span> Use the <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-700 border border-gray-600 rounded-md">Spacebar</kbd> to play. Hold <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-700 border border-gray-600 rounded-md">Alt</kbd> to pan left, or <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-gray-700 border border-gray-600 rounded-md">Shift</kbd> to pan right.
        </p>
      </div>

    </div>
  );
};

export default Controls;