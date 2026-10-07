import type { SoundCorner } from '../types';

export interface FootstepPreset {
  id: string;
  name: string;
  description: string;
  corners: Record<SoundCorner, { url: string; name: string }>;
}

const audioFiles = import.meta.glob<string>(
  '../Footstep Foley SFX Pack - wav (HD)/*.wav',
  { eager: true, query: '?url', import: 'default' }
);

const surfaces = [
  'Broken Glass',
  'Metal Pipe',
  'Concrete',
  'Flesh',
  'Foliage',
  'Grass',
  'Gravel',
  'Ice',
  'Lava',
  'Metal',
  'Puddle',
  'Sand',
  'Snow',
  'Stone',
  'Water',
  'Wood',
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const presetsBySurface = new Map<string, { url: string; variation: number }[]>();

Object.entries(audioFiles).forEach(([path, url]) => {
  const filename = path.split('/').pop() ?? '';
  const normalizedFilename = normalize(filename.replace(/\.wav$/i, ''));
  const surface = surfaces.find(candidate => normalizedFilename.includes(normalize(candidate)));
  if (!surface) return;

  const variation = Number(filename.match(/(\d+)(?!.*\d)/)?.[1] ?? 1);
  const variations = presetsBySurface.get(surface) ?? [];
  variations.push({ url, variation });
  presetsBySurface.set(surface, variations);
});

const corners: SoundCorner[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

export const footstepPresets: FootstepPreset[] = surfaces.flatMap(surface => {
  const variations = presetsBySurface.get(surface)?.sort((a, b) => a.variation - b.variation) ?? [];
  if (variations.length === 0) return [];

  const sounds = corners.map((_, index) => variations[index % variations.length]);
  const label = surface;

  return [{
    id: normalize(surface),
    name: `${label} Footsteps`,
    description: `${variations.length} sound variation${variations.length === 1 ? '' : 's'} from the WAV pack.`,
    corners: Object.fromEntries(corners.map((corner, index) => {
      const sound = sounds[index];
      return [corner, {
        url: sound.url,
        name: `${label} · Variation ${sound.variation}`,
      }];
    })) as FootstepPreset['corners'],
  }];
});
