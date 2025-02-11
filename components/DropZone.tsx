import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropZoneProps {
  onFilesDrop: (files: File[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}`}
    >
      <input {...getInputProps()} />
      <p className="text-gray-600 dark:text-gray-300">
        {isDragActive
          ? "Déposez les images ici..."
          : "Glissez-déposez vos images ici, ou cliquez pour sélectionner"}
      </p>
    </div>
  );
} 