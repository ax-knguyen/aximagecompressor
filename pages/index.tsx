import { useState, useEffect } from 'react';
import DropZone from '../components/DropZone';
import ImageTable from '../components/ImageTable';
import { Geist } from "next/font/google";
import JSZip from 'jszip';

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

interface ImageSettings {
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  quality: number;
}

interface ImageInfo {
  id: string;
  name: string;
  originalSize: number;
  optimizedSize: number;
  status: 'processing' | 'completed' | 'error';
  optimizedImage?: string;
  errorMessage?: string;
  originalImage?: string;
}

const presets = {
  web: { format: 'webp', quality: 80, width: 1920 },
  thumbnail: { format: 'webp', quality: 60, width: 300 },
  mobile: { format: 'webp', quality: 75, width: 828 },
};

export default function Home() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [settings, setSettings] = useState<ImageSettings>({
    format: 'webp',
    quality: 80
  });
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);

  const optimizeImage = async (file: File, id: string) => {
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          settings: {
            ...settings,
            width: settings.width || undefined,
            height: settings.height || undefined,
            quality: Math.max(1, Math.min(100, settings.quality))
          },
        }),
      });

      if (!response.ok) throw new Error('Optimisation échouée');

      const data = await response.json();
      
      setImages(prev => prev.map(img => 
        img.id === id 
          ? { ...img, optimizedSize: data.size, status: 'completed' as const, optimizedImage: data.optimizedImage }
          : img
      ));

      return data.optimizedImage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setImages(prev => prev.map(img => 
        img.id === id 
          ? { ...img, status: 'error', errorMessage }
          : img
      ));
      throw error;
    }
  };

  const handleFilesDrop = async (files: File[]) => {
    setOriginalFiles(files);
    const newImages = await Promise.all(files.map(async file => {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        originalSize: file.size,
        optimizedSize: 0,
        status: 'processing' as const,
        optimizedImage: '',
        originalImage: base64
      };
    }));

    setImages(prev => [...prev, ...newImages]);

    const totalFiles = files.length;
    let processed = 0;

    for (const file of files) {
      const image = newImages.find(img => img.name === file.name);
      if (image) {
        await optimizeImage(file, image.id);
        processed++;
        setProgress((processed / totalFiles) * 100);
      }
    }
  };

  const applyDimensions = async () => {
    if (originalFiles.length === 0) return;

    const imagesToProcess = images.map(img => ({
      ...img,
      status: 'processing' as const,
    }));

    setImages(imagesToProcess);

    try {
      for (const file of originalFiles) {
        const image = imagesToProcess.find(img => img.name === file.name);
        if (image) {
          await optimizeImage(file, image.id);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'application des dimensions:', error);
    }
  };

  const updateSettings = (newSettings: Partial<ImageSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const handleDownload = async () => {
    if (images.length === 0) return;

    const zip = new JSZip();
    const optimizedImages = await Promise.all(
      images.map(async (image) => {
        const base64Data = image.optimizedImage || '';
        let mimeType;
        switch (settings.format) {
          case 'webp':
            mimeType = 'image/webp';
            break;
          case 'avif':
            mimeType = 'image/avif';
            break;
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'png':
            mimeType = 'image/png';
            break;
          default:
            mimeType = 'image/webp';
        }

        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        return {
          name: `${image.name.split('.')[0]}.${settings.format}`,
          data: blob
        };
      })
    );

    if (images.length === 1) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(optimizedImages[0].data);
      link.download = optimizedImages[0].name;
      link.click();
    } else {
      optimizedImages.forEach(img => {
        zip.file(img.name, img.data);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'images-optimisees.zip';
      link.click();
    }
  };

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    
    const deletedImage = images.find(img => img.id === id);
    if (deletedImage) {
      setOriginalFiles(prev => prev.filter(file => file.name !== deletedImage.name));
    }
  };

  const handleClearAll = () => {
    setImages([]);
    setOriginalFiles([]);
    setProgress(0);
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleDownload();
      }
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        applyDimensions();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className={`${geist.variable} min-h-screen bg-white dark:bg-gray-900`}>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">
          Optimiseur d'images
        </h1>

        <div className="space-y-8">
          <DropZone onFilesDrop={handleFilesDrop} />

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Paramètres</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Format
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    value={settings.format}
                    onChange={(e) => updateSettings({ format: e.target.value as any })}
                  >
                    <option value="webp">WebP</option>
                    <option value="avif">AVIF</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </label>
              </div>

              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Qualité
                  <span className="ml-1 text-gray-400">ⓘ</span>
                </label>
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded p-2">
                  Une qualité plus basse donnera des fichiers plus légers mais potentiellement plus dégradés
                </div>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  value={settings.quality}
                  onChange={(e) => updateSettings({ quality: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Largeur
                  <input
                    type="number"
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    value={settings.width || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSettings({
                        width: value ? Math.max(1, parseInt(value)) : undefined
                      });
                    }}
                    placeholder="Largeur en pixels"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hauteur
                  <input
                    type="number"
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    value={settings.height || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateSettings({
                        height: value ? Math.max(1, parseInt(value)) : undefined
                      });
                    }}
                    placeholder="Hauteur en pixels"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium">Préréglages</label>
                <select
                  onChange={(e) => {
                    const preset = presets[e.target.value as keyof typeof presets];
                    if (preset) {
                      setSettings(prev => ({ ...prev, ...preset }));
                    }
                  }}
                  className="mt-1 block w-full rounded-md"
                >
                  <option value="">Personnalisé</option>
                  <option value="web">Web</option>
                  <option value="thumbnail">Vignette</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>
            {images.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm"
                  onClick={applyDimensions}
                >
                  Appliquer les dimensions
                </button>
              </div>
            )}
          </div>

          {images.length > 0 && progress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <ImageTable 
            images={images} 
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            settings={settings}
          />

          {images.length > 0 && (
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
                onClick={applyDimensions}
              >
                Appliquer les dimensions
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
                onClick={handleDownload}
              >
                Télécharger {images.length > 1 ? 'les images' : "l'image"}
              </button>
              {images.length > 1 && (
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full"
                  onClick={handleClearAll}
                >
                  Tout supprimer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
