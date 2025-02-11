export interface ImageInfo {
  id: string;
  name: string;
  originalSize: number;
  optimizedSize: number;
  status: 'processing' | 'completed' | 'error';
  optimizedImage?: string;
  originalImage?: string;
  dimensions?: {
    width: number;
    height: number;
  };
} 