export interface Preset {
  id?: string;
  name: string;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  quality: number;
  width?: number;
  height?: number;
  description?: string;
}

export type PresetRecord = Record<string, Preset>; 