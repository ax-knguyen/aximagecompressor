import React, { useState } from 'react';

interface ImagePreviewProps {
  original: string;
  optimized: string;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  showSideBySide?: boolean;
}

export function ImagePreview({ original, optimized, format, showSideBySide }: ImagePreviewProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  if (showSideBySide) {
    return (
      <div className="flex gap-2">
        <div className="relative">
          <img 
            src={original}
            alt="Original"
            className="h-32 w-32 object-cover rounded"
          />
          <span className="absolute top-0 right-0 text-xs bg-black/50 text-white px-1 rounded">
            Original
          </span>
        </div>
        <div className="relative">
          <img 
            src={optimized}
            alt="Optimisé"
            className="h-32 w-32 object-cover rounded"
          />
          <span className="absolute top-0 right-0 text-xs bg-black/50 text-white px-1 rounded">
            Optimisé
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img 
        src={showOriginal ? original : optimized}
        alt="Preview"
        className="h-12 w-12 object-cover rounded cursor-pointer"
        onMouseEnter={() => setShowOriginal(true)}
        onMouseLeave={() => setShowOriginal(false)}
      />
      <span className="absolute top-0 right-0 text-xs bg-black/50 text-white px-1 rounded">
        {showOriginal ? 'Original' : 'Optimisé'}
      </span>
    </div>
  );
} 