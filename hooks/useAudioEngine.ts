// Fix: Provide a full implementation for the useAudioEngine custom hook. This file was previously a placeholder.
import { useState, useRef, useEffect, useCallback } from 'react';
import { AxisMode, SoundSources, ReverbPreset, SoundCorner } from '../types';

const REVERB_FILES: Record<ReverbPreset, string | null> = {
  none: null,
  hall: '/reverbs/large-hall.wav',
  bathroom: '/reverbs/bathroom.wav',
  tunnel: '/reverbs/tunnel.wav',
  hallway: '/reverbs/hallway.wav',
};

export const useAudioEngine = (
  soundSources: SoundSources,
  reverbPreset: ReverbPreset,
  reverbWet: number
) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Partial<Record<SoundCorner, { buffer: AudioBuffer; file: File }>>>({});
  
  const masterGainRef = useRef<GainNode | null>(null);
  const masterDryGainRef = useRef<GainNode | null>(null);
  const masterWetGainRef = useRef<GainNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);

  const initAudioContext = useCallback(async () => {
    if (isInitialized) return;
    
    console.log('Initializing AudioContext...');
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (context.state === 'suspended') {
      await context.resume();
    }

    audioContextRef.current = context;

    // Create main signal path
    masterGainRef.current = context.createGain();
    masterDryGainRef.current = context.createGain();
    masterWetGainRef.current = context.createGain();
    convolverRef.current = context.createConvolver();
    
    masterGainRef.current.connect(masterDryGainRef.current);
    masterGainRef.current.connect(convolverRef.current);

    convolverRef.current.connect(masterWetGainRef.current);
    
    masterDryGainRef.current.connect(context.destination);
    masterWetGainRef.current.connect(context.destination);
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Effect to load sound source files into AudioBuffers
  useEffect(() => {
    const context = audioContextRef.current;
    if (!context || !isInitialized) return;

    Object.entries(soundSources).forEach(async ([key, source]) => {
      const corner = key as SoundCorner;
      
      if (source.file) {
        if (audioBuffersRef.current[corner]?.file !== source.file) {
          try {
            const arrayBuffer = await source.file.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            audioBuffersRef.current[corner] = { buffer: audioBuffer, file: source.file };
            console.log(`Loaded audio for ${corner}`);
          } catch (error) {
            console.error(`Error decoding audio file for ${corner}:`, error);
            delete audioBuffersRef.current[corner];
          }
        }
      } else {
        if (audioBuffersRef.current[corner]) {
          delete audioBuffersRef.current[corner];
        }
      }
    });
  }, [soundSources, isInitialized]);

  // Effect to load reverb impulse response
  useEffect(() => {
    const context = audioContextRef.current;
    const convolver = convolverRef.current;
    if (!context || !isInitialized || !convolver) return;

    const reverbUrl = REVERB_FILES[reverbPreset];
    if (reverbUrl) {
      fetch(reverbUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          convolver.buffer = audioBuffer;
          console.log(`Loaded reverb: ${reverbPreset}`);
        })
        .catch(error => console.error(`Failed to load reverb impulse for ${reverbPreset}`, error));
    } else {
      convolver.buffer = null; // No reverb
    }
  }, [reverbPreset, isInitialized]);

  // Effect to update reverb wet/dry mix
  useEffect(() => {
    const context = audioContextRef.current;
    if (!isInitialized || !masterDryGainRef.current || !masterWetGainRef.current || !context) return;
    
    const dryValue = reverbPreset === 'none' ? 1 : 1 - reverbWet;
    const wetValue = reverbPreset === 'none' ? 0 : reverbWet;
    
    masterDryGainRef.current.gain.setValueAtTime(dryValue, context.currentTime);
    masterWetGainRef.current.gain.setValueAtTime(wetValue, context.currentTime);
  }, [reverbWet, reverbPreset, isInitialized]);

  const triggerSound = useCallback((position: { x: number, y: number }, axisMode: AxisMode, panOffset: number = 0) => {
    const context = audioContextRef.current;
    if (!context || !isInitialized || !masterGainRef.current) return;

    const { x, y } = position;

    if (axisMode === AxisMode.BLEND) {
      const gains = {
        topLeft: (1 - x) * (1 - y),
        topRight: x * (1 - y),
        bottomLeft: (1 - x) * y,
        bottomRight: x * y,
      };

      (Object.keys(gains) as SoundCorner[]).forEach(corner => {
        const buffer = audioBuffersRef.current[corner]?.buffer;
        const sourceInfo = soundSources[corner];
        if (buffer && sourceInfo) {
          const source = context.createBufferSource();
          source.buffer = buffer;
          
          const gainNode = context.createGain();
          gainNode.gain.value = gains[corner] * sourceInfo.volume;

          source.connect(gainNode);
          gainNode.connect(masterGainRef.current!);

          source.start(0);
        }
      });
    } else if (axisMode === AxisMode.PAN) {
        const sound1Buffer = audioBuffersRef.current.topLeft?.buffer;
        const sound2Buffer = audioBuffersRef.current.bottomLeft?.buffer;
        const sound1Info = soundSources.topLeft;
        const sound2Info = soundSources.bottomLeft;

        const sound1Gain = (1 - y);
        const sound2Gain = y;

        const panValue = Math.max(-1, Math.min(1, (x * 2 - 1) + panOffset));
        const panner = context.createStereoPanner();
        panner.pan.setValueAtTime(panValue, context.currentTime);

        panner.connect(masterGainRef.current!);
        
        if (sound1Buffer && sound1Info) {
            const source = context.createBufferSource();
            source.buffer = sound1Buffer;
            
            const gainNode = context.createGain();
            gainNode.gain.value = sound1Gain * sound1Info.volume;

            source.connect(gainNode);
            gainNode.connect(panner);
            source.start(0);
        }

        if (sound2Buffer && sound2Info) {
            const source = context.createBufferSource();
            source.buffer = sound2Buffer;
            
            const gainNode = context.createGain();
            gainNode.gain.value = sound2Gain * sound2Info.volume;

            source.connect(gainNode);
            gainNode.connect(panner);
            source.start(0);
        }
    }
  }, [isInitialized, soundSources]);
  
  return { initAudioContext, isInitialized, triggerSound };
};
