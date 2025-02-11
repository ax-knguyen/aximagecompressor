export interface ImageSettings {
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  quality: number;
} 