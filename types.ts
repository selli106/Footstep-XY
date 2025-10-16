export enum AxisMode {
  BLEND = 'BLEND',
  PAN = 'PAN',
}

export interface SoundSource {
  url: string | null;
  file: File | null;
  volume: number;
  name: string | null;
}

export interface SoundSources {
  topLeft: SoundSource;
  topRight: SoundSource;
  bottomLeft: SoundSource;
  bottomRight: SoundSource;
}

export type SoundCorner = keyof SoundSources;

export type ReverbPreset = 'none' | 'hall' | 'bathroom' | 'tunnel' | 'hallway';