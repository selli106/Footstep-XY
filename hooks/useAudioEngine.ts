
import { useRef, useEffect, useCallback, useState } from 'react';
import type { SoundSources, AxisMode, SoundCorner } from '../types';

export function useAudioEngine(sounds: SoundSources) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const audioBuffersRef = useRef<Map<keyof SoundSources, AudioBuffer>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const masterGain = context.createGain();
      masterGain.gain.value = 1.0;
      masterGain.connect(context.destination);
      masterGainRef.current = masterGain;

      setIsInitialized(true);
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close().catch(console.error);
    };
  }, []);

  useEffect(() => {
    if (!audioContextRef.current) return;
    const context = audioContextRef.current;
    
    Object.entries(sounds).forEach(async ([corner, sourceInfo]) => {
      const url = sourceInfo.url;
      if (url) {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await context.decodeAudioData(arrayBuffer);
          audioBuffersRef.current.set(corner as SoundCorner, audioBuffer);
        } catch (error) {
          console.error(`Error loading sound for ${corner}:`, error);
        }
      } else {
        audioBuffersRef.current.delete(corner as SoundCorner);
      }
    });
  }, [sounds]);

  const triggerSound = useCallback((xy: { x: number; y: number }, axisMode: AxisMode, panOffset = 0) => {
    const context = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain || context.state !== 'running') {
      console.warn('AudioContext not running, cannot play sound.');
      return;
    }
    
    const { x, y } = xy;
    const now = context.currentTime;
    
    if (axisMode === 'BLEND') {
      const gains = {
        topLeft: (1 - x) * (1 - y),
        topRight: x * (1 - y),
        bottomLeft: (1 - x) * y,
        bottomRight: x * y,
      };
      
      const panner = context.createStereoPanner();
      panner.pan.value = panOffset;
      panner.connect(masterGain);

      (Object.keys(gains) as SoundCorner[]).forEach(corner => {
        const buffer = audioBuffersRef.current.get(corner);
        const soundInfo = sounds[corner];
        if (buffer && soundInfo && gains[corner] > 0) {
          const gainNode = context.createGain();
          gainNode.gain.value = gains[corner] * soundInfo.volume;
          gainNode.connect(panner);

          const sourceNode = context.createBufferSource();
          sourceNode.buffer = buffer;
          sourceNode.loop = false;
          sourceNode.connect(gainNode);
          sourceNode.start(now);
        }
      });

    } else if (axisMode === 'PAN') {
      const topGainValue = 1 - y;
      const bottomGainValue = y;
      const panValue = x * 2 - 1;
      const finalPan = Math.max(-1, Math.min(1, panValue + panOffset));
      
      const panner = context.createStereoPanner();
      panner.pan.value = finalPan;
      panner.connect(masterGain);
      
      const topLeftBuffer = audioBuffersRef.current.get('topLeft');
      const topLeftInfo = sounds.topLeft;
      if (topLeftBuffer && topLeftInfo && topGainValue > 0) {
        const gainNode = context.createGain();
        gainNode.gain.value = topGainValue * topLeftInfo.volume;
        gainNode.connect(panner);
        
        const sourceNode = context.createBufferSource();
        sourceNode.buffer = topLeftBuffer;
        sourceNode.loop = false;
        sourceNode.connect(gainNode);
        sourceNode.start(now);
      }

      const bottomLeftBuffer = audioBuffersRef.current.get('bottomLeft');
      const bottomLeftInfo = sounds.bottomLeft;
      if (bottomLeftBuffer && bottomLeftInfo && bottomGainValue > 0) {
        const gainNode = context.createGain();
        gainNode.gain.value = bottomGainValue * bottomLeftInfo.volume;
        gainNode.connect(panner);

        const sourceNode = context.createBufferSource();
        sourceNode.buffer = bottomLeftBuffer;
        sourceNode.loop = false;
        sourceNode.connect(gainNode);
        sourceNode.start(now);
      }
    }
  }, [sounds]);

  return { initAudioContext, isInitialized, triggerSound };
}