import React, { useState } from 'react';
import { ImagePreview } from './ImagePreview';
import { ImageComparison } from './ImageComparison';

interface ImageInfo {
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

interface ImageTableProps {
  images: ImageInfo[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  settings: {
    format: 'webp' | 'avif' | 'jpeg' | 'png';
  };
}

const truncateFileName = (name: string, maxLength: number = 20) => {
  if (name.length <= maxLength) return name;
  const extension = name.split('.').pop() || '';
  const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 3);
  return `${truncatedName}...${extension}`;
};

export default function ImageTable({ images, onDelete, onClearAll, settings }: ImageTableProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (images.length === 0) return null;

  return (
    <>
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium dark:text-white">Images ({images.length})</h2>
          {images.length > 1 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Tout supprimer
            </button>
          )}
        </div>
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fichier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Taille originale
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Taille optimisée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Réduction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Aperçu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {images.map((image) => (
              <tr key={image.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <span title={image.name}>{truncateFileName(image.name)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {(image.originalSize / 1024).toFixed(2)} KB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {image.optimizedSize ? `${(image.optimizedSize / 1024).toFixed(2)} KB` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {image.optimizedSize
                    ? `${(((image.originalSize - image.optimizedSize) / image.originalSize) * 100).toFixed(1)}%`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {image.optimizedImage ? (
                    <div className="relative group">
                      <ImagePreview 
                        original={`data:image/*;base64,${image.originalImage}`}
                        optimized={`data:image/${settings.format};base64,${image.optimizedImage}`}
                        format={settings.format}
                        showSideBySide={selectedImage === image.id}
                      />
                      <button
                        onClick={() => setSelectedImage(selectedImage === image.id ? null : image.id)}
                        className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 text-xs"
                        title="Comparer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {image.status === 'processing' && (
                    <span className="text-yellow-500 flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      En cours...
                    </span>
                  )}
                  {image.status === 'completed' && (
                    <span className="text-green-500">Terminé</span>
                  )}
                  {image.status === 'error' && (
                    <span className="text-red-500">Erreur</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onDelete(image.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {images.length > 1 && (
            <tfoot>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-sm font-medium">
                  Taille totale
                </td>
                <td className="px-6 py-4 text-sm">
                  {(images.reduce((acc, img) => acc + img.originalSize, 0) / 1024 / 1024).toFixed(2)} MB →{' '}
                  {(images.reduce((acc, img) => acc + (img.optimizedSize || 0), 0) / 1024 / 1024).toFixed(2)} MB
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {selectedImage && (
        <ImageComparison
          original={`data:image/*;base64,${images.find(img => img.id === selectedImage)?.originalImage}`}
          optimized={`data:image/${settings.format};base64,${images.find(img => img.id === selectedImage)?.optimizedImage}`}
          name={images.find(img => img.id === selectedImage)?.name || ''}
          onClose={() => setSelectedImage(null)}
          originalSize={images.find(img => img.id === selectedImage)?.originalSize || 0}
          optimizedSize={images.find(img => img.id === selectedImage)?.optimizedSize || 0}
          format={settings.format}
          dimensions={images.find(img => img.id === selectedImage)?.dimensions}
        />
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer toutes les images ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={() => setShowClearConfirm(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
              >
                Supprimer tout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 