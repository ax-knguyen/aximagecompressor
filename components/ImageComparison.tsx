import React, { useEffect, useRef, useState } from 'react';
import { ZoomView } from './ZoomView';

interface ExifData {
  make?: string;
  model?: string;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  dateTime?: string;
}

interface ImageComparisonProps {
  original: string;
  optimized: string;
  name: string;
  onClose: () => void;
  originalSize: number;
  optimizedSize: number;
  format: string;
  dimensions?: {
    width: number;
    height: number;
  };
  exifData?: ExifData;
}

export function ImageComparison({ 
  original, 
  optimized, 
  name, 
  onClose,
  originalSize,
  optimizedSize,
  format,
  dimensions,
  exifData
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'compare' | 'exif'>('compare');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setSliderPosition(prev => Math.max(0, prev - 5));
      if (e.key === 'ArrowRight') setSliderPosition(prev => Math.min(100, prev + 5));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const reductionPercentage = ((originalSize - optimizedSize) / originalSize) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-5xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium dark:text-white">{name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Fermer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'compare'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('compare')}
          >
            Comparaison
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'exif'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab('exif')}
          >
            Métadonnées EXIF
          </button>
        </div>

        {activeTab === 'compare' ? (
          <>
            {/* Informations sur l'image */}
            <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="text-gray-500 dark:text-gray-400">Format</div>
                <div className="font-medium">{format.toUpperCase()}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="text-gray-500 dark:text-gray-400">Dimensions</div>
                <div className="font-medium">
                  {dimensions ? `${dimensions.width}×${dimensions.height}px` : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="text-gray-500 dark:text-gray-400">Taille originale</div>
                <div className="font-medium">{(originalSize / 1024).toFixed(2)} KB</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="text-gray-500 dark:text-gray-400">Réduction</div>
                <div className="font-medium text-green-500">-{reductionPercentage.toFixed(1)}%</div>
              </div>
            </div>

            {/* Comparaison avec slider et zoom */}
            <div 
              ref={containerRef}
              className="relative h-[600px] overflow-hidden rounded-lg cursor-crosshair"
              onMouseMove={(e) => {
                handleMouseMove(e);
                if (showZoom) {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setZoomPosition({
                      x: ((e.clientX - rect.left) / rect.width) * 100,
                      y: ((e.clientY - rect.top) / rect.height) * 100,
                    });
                  }
                }
              }}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onTouchMove={(e) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const touch = e.touches[0];
                const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                setSliderPosition((x / rect.width) * 100);
              }}
            >
              {/* Image optimisée (arrière-plan) */}
              <img 
                src={optimized}
                alt="Optimisé"
                className="absolute inset-0 w-full h-full object-contain"
              />
              
              {/* Image originale (premier plan, coupée par le slider) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img 
                  src={original}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>

              {/* Slider */}
              <div 
                className="absolute inset-y-0"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute inset-y-0 -ml-px w-0.5 bg-white shadow"></div>
                <div className="absolute top-1/2 -ml-4 -mt-6 w-8 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l2-2 2 2V5H8zm6 0v14l2-2 2 2V5h-4z" />
                  </svg>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                Original
              </div>
              <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                Optimisé
              </div>

              {/* Zoom overlay */}
              {showZoom && (
                <ZoomView
                  original={original}
                  optimized={optimized}
                  position={zoomPosition}
                  sliderPosition={sliderPosition}
                />
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Utilisez le slider ou les flèches gauche/droite pour comparer les images
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-4">Métadonnées EXIF</h4>
              {exifData ? (
                <div className="space-y-2">
                  {exifData.make && (
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Appareil</span>
                      <span>{exifData.make} {exifData.model}</span>
                    </div>
                  )}
                  {exifData.exposureTime && (
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Vitesse</span>
                      <span>{exifData.exposureTime}s</span>
                    </div>
                  )}
                  {exifData.fNumber && (
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Ouverture</span>
                      <span>f/{exifData.fNumber}</span>
                    </div>
                  )}
                  {exifData.iso && (
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">ISO</span>
                      <span>{exifData.iso}</span>
                    </div>
                  )}
                  {exifData.focalLength && (
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Focale</span>
                      <span>{exifData.focalLength}mm</span>
                    </div>
                  )}
                  {exifData.dateTime && (
                    <div className="grid grid-cols-2">
                      <span className="text-gray-500">Date</span>
                      <span>{new Date(exifData.dateTime).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Aucune métadonnée EXIF disponible</p>
              )}
            </div>
            <div>
              <h4 className="font-medium mb-4">Optimisation</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Réduction de taille</span>
                  <span className="text-green-500">-{reductionPercentage.toFixed(1)}%</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Format original</span>
                  <span>{name.split('.').pop()?.toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-500">Format optimisé</span>
                  <span>{format.toUpperCase()}</span>
                </div>
                {dimensions && (
                  <div className="grid grid-cols-2">
                    <span className="text-gray-500">Dimensions</span>
                    <span>{dimensions.width}×{dimensions.height}px</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 