import React from 'react';

interface ZoomViewProps {
  original: string;
  optimized: string;
  position: { x: number; y: number };
  sliderPosition: number;
}

export function ZoomView({ original, optimized, position, sliderPosition }: ZoomViewProps) {
  const zoomFactor = 3;
  const zoomSize = 200;
  const halfZoomSize = zoomSize / 2;

  return (
    <div 
      className="absolute w-[200px] h-[200px] rounded-full overflow-hidden border-2 border-white shadow-xl pointer-events-none backdrop-blur-sm"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      {/* Image optimisée (arrière-plan) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${optimized})`,
          backgroundPosition: `${position.x}% ${position.y}%`,
          backgroundSize: `${zoomFactor * 100}%`,
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Image originale (premier plan, coupée par le slider) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${original})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: `${zoomFactor * 100}%`,
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>

      {/* Ligne de séparation */}
      <div 
        className="absolute inset-y-0 w-0.5 bg-white shadow-md"
        style={{ left: `${sliderPosition}%` }}
      />

      {/* Croix centrale avec style amélioré */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-px bg-white/70 shadow-sm"></div>
          <div className="h-4 w-px bg-white/70 shadow-sm -mt-[1px]"></div>
        </div>
      </div>
    </div>
  );
} 