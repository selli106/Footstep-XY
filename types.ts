export enum AxisMode {
  BLEND = 'BLEND',
  PAN = 'PAN',
}

export interface SoundSource {
  url: string | null;
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