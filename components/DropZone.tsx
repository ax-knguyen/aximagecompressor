import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropZoneProps {
  onFilesDrop: (files: File[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/avif': ['.avif'],
  'image/gif': ['.gif'],
  'image/tiff': ['.tiff', '.tif'],
  'image/bmp': ['.bmp'],
};

export default function DropZone({ onFilesDrop }: DropZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        return false;
      }
      return true;
    });
    onFilesDrop(validFiles);
  }, [onFilesDrop]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
        ${isDragActive 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-gray-200 hover:border-primary/50 hover:scale-[1.01]'
        }
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-6">
        <p className="text-lg text-text-light font-medium">
          {isDragActive
            ? "Déposez les images ici..."
            : isDragReject
            ? "Type de fichier non supporté"
            : "Glissez-déposez vos images ici, ou cliquez pour sélectionner"}
        </p>
        <div className="flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-12 h-12 transition-colors duration-300 ${
              isDragActive ? 'text-primary' : 'text-gray-400'
            }`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
} 