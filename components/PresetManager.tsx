import React from 'react';
import type { Preset } from '../hooks/usePresets';

interface PresetManagerProps {
  customPresets: Record<string, Preset>;
  onEdit: (presetId: string) => void;
  onDelete: (presetId: string) => void;
  onClose: () => void;
}

export function PresetManager({ customPresets, onEdit, onDelete, onClose }: PresetManagerProps) {
  return (
    <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-xl shadow-lg max-w-2xl w-full mx-4">
        <div className="p-6 border-b border-default">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-text">
              Gérer les préréglages
            </h3>
            <button
              onClick={onClose}
              className="text-text-light hover:text-text transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {Object.entries(customPresets).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(customPresets).map(([id, preset]) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-4 bg-surface rounded-xl transition-colors hover:bg-surface-hover"
                >
                  <div>
                    <h4 className="font-medium text-text">{preset.name}</h4>
                    <p className="text-sm text-text-light">
                      {preset.format.toUpperCase()} • {preset.quality}% • 
                      {preset.width ? ` ${preset.width}px` : ''} 
                      {preset.height ? ` × ${preset.height}px` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(id)}
                      className="p-2 text-blue-500 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(id)}
                      className="p-2 text-red-500 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-light py-8">
              Aucun préréglage personnalisé
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 