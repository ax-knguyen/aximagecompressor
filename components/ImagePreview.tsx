import React, { useState } from 'react';

interface ImagePreviewProps {
  original: string;
  optimized: string;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  showSideBySide?: boolean;
}

export function ImagePreview({ original, optimized, format, showSideBySide }: ImagePreviewProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="relative group">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-background shadow-md">
        <img
          src={optimized}
          alt="Aperçu"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute inset-0 -m-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="relative w-48 rounded-xl overflow-hidden shadow-xl bg-background">
          {showSideBySide ? (
            <div className="flex">
              <div className="w-1/2 border-r border-default">
                <div className="p-1 text-xs text-center text-text-light bg-surface">Original</div>
                <img src={original} alt="Original" className="w-full" />
              </div>
              <div className="w-1/2">
                <div className="p-1 text-xs text-center text-text-light bg-surface">Optimisé</div>
                <img src={optimized} alt="Optimisé" className="w-full" />
              </div>
            </div>
          ) : (
            <img src={optimized} alt="Aperçu" className="w-full" />
          )}
        </div>
      </div>
    </div>
  );
} 