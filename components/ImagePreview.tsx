import Image from 'next/image';
import React from 'react';

interface ImagePreviewProps {
  original: string;
  optimized: string;
  showSideBySide?: boolean;
}

export function ImagePreview({ original, optimized, showSideBySide }: ImagePreviewProps) {
  return (
    <div className="relative group">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-background shadow-md">
        <Image
          src={optimized}
          alt="Aperçu"
          className="w-full h-full object-cover"
          width={64}
          height={64}
        />
      </div>
      
      <div className="absolute inset-0 -m-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="relative w-48 rounded-xl overflow-hidden shadow-xl bg-background">
          {showSideBySide ? (
            <div className="flex">
              <div className="w-1/2 border-r border-default">
                <div className="p-1 text-xs text-center text-text-light bg-surface">Original</div>
                <Image src={original} alt="Original" className="w-full" width={200} height={200} />
              </div>
              <div className="w-1/2">
                <div className="p-1 text-xs text-center text-text-light bg-surface">Optimisé</div>
                <Image src={optimized} alt="Optimisé" className="w-full" width={200} height={200} />
              </div>
            </div>
          ) : (
            <Image
              src={optimized}
              alt="Aperçu"
              className="w-full"
              width={64}
              height={64}
            />
          )}
        </div>
      </div>
    </div>
  );
} 