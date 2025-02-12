import { useState, useEffect, useCallback } from 'react';
import DropZone from '../components/DropZone';
import ImageTable from '../components/ImageTable';
import { Inter } from "next/font/google";
import JSZip from 'jszip';
import { usePresets } from '../hooks/usePresets';
import { PresetManager } from '../components/PresetManager';
import { ThemeSwitch } from '../components/ThemeSwitch';
import { Button } from '../components/Button';
import type { ImageSettings } from '../types/settings';
import imageCompression from 'browser-image-compression';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
});

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

const formatInfo = {
  webp: {
    name: 'WebP',
    description: "Format moderne recommandé pour le web. Excellent compromis entre qualité et compression. Compatible avec tous les navigateurs modernes.",
    bestFor: 'Sites web, applications web',
  },
  avif: {
    name: 'AVIF',
    description: "Format nouvelle génération offrant la meilleure compression. Support limité aux navigateurs récents.",
    bestFor: 'Applications modernes nécessitant une compression maximale',
  },
  jpeg: {
    name: 'JPEG',
    description: "Format universel, idéal pour les photos. Compression avec perte mais très compatible.",
    bestFor: 'Photos, images avec beaucoup de couleurs',
  },
  png: {
    name: 'PNG',
    description: "Format sans perte, parfait pour les images avec transparence ou texte.",
    bestFor: 'Logos, icônes, captures d\'écran',
  },
};

const presetInfo = {
  web: {
    name: 'Web',
    format: 'webp',
    quality: 80,
    width: 1920,
    description: 'Optimisé pour les images pleine largeur sur desktop. Bon équilibre qualité/poids.',
  },
  thumbnail: {
    name: 'Vignette',
    format: 'webp',
    quality: 60,
    width: 300,
    description: 'Pour les miniatures et aperçus. Privilégie la compression.',
  },
  mobile: {
    name: 'Mobile',
    format: 'webp',
    quality: 75,
    width: 828,
    description: 'Adapté aux écrans mobiles. Optimisé pour le chargement rapide.',
  },
};

// Style commun pour tous les selects
const selectClassName = "w-full px-4 py-2.5 rounded-xl border border-default bg-background text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all pr-10";

// Style pour le wrapper des selects
const selectWrapperClassName = "relative";

// Ajoutons un style global pour les selects
<style jsx global>{`
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: none !important;
  }
  
  /* Pour Firefox */
  select {
    -moz-appearance: none;
    text-indent: 0.01px;
    text-overflow: '';
  }
  
  /* Pour IE et Edge */
  select::-ms-expand {
    display: none;
  }
  
  optgroup {
    font-weight: 600;
    color: var(--primary);
    padding: 0.5rem;
  }
  
  option {
    font-weight: normal;
    color: var(--text);
    padding: 0.5rem;
  }
  
  .dark option {
    color: var(--text-light);
    background: var(--secondary);
  }
  
  .dark optgroup {
    color: var(--accent);
    background: var(--secondary);
  }

  /* Suppression des flèches des inputs number */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
  }

  /* Personnalisation de l'input range */
  input[type="range"] {
    -webkit-appearance: none;
    height: 8px;
    background: var(--surface);
    border-radius: 9999px;
    background-image: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    margin-top: -4px;
  }

  input[type="range"]::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    border: none;
  }

  input[type="range"]::-ms-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
`}</style>

export default function Home() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [settings, setSettings] = useState<ImageSettings>({
    format: 'webp',
    quality: 80
  });
  const [originalFiles, setOriginalFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const { allPresets, savePreset, deletePreset, editPreset, customPresets } = usePresets();
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [showPresetsManager, setShowPresetsManager] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Récupérer l'état initial depuis le localStorage
    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) {
      setIsSidebarOpen(JSON.parse(saved));
    }
  }, []); // S'exécute une seule fois au montage

  useEffect(() => {
    // Sauvegarder dans le localStorage à chaque changement
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  const optimizeImage = useCallback(async (file: File, id: string) => {
    try {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: settings.width || 1920,
        useWebWorker: true,
        fileType: `image/${settings.format}`,
        quality: settings.quality / 100,
      };

      const compressedFile = await imageCompression(file, options);
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile);

      setImages(prev => prev.map(img => 
        img.id === id 
          ? { 
              ...img, 
              optimizedSize: compressedFile.size, 
              status: 'completed' as const, 
              optimizedImage: base64.split(',')[1] 
            }
          : img
      ));

      return base64;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setImages(prev => prev.map(img => 
        img.id === id 
          ? { ...img, status: 'error', errorMessage }
          : img
      ));
      throw error;
    }
  }, [settings, setImages]);

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

  const applyDimensions = useCallback(async () => {
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
      console.error("Erreur lors de l&apos;application des dimensions:", error);
    }
  }, [originalFiles, images, optimizeImage, setImages]);

  const updateSettings = (newSettings: Partial<ImageSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const handleDownload = useCallback(async () => {
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
  }, [images, settings, settings.format]);

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

  const handlePresetAction = (presetId: string, action: 'edit' | 'delete') => {
    if (action === 'edit') {
      const preset = customPresets[presetId];
      if (preset) {
        setEditingPreset(presetId);
        setNewPresetName(preset.name);
        setSettings({
          format: preset.format,
          quality: preset.quality,
          width: preset.width,
          height: preset.height
        });
        setShowPresetModal(true);
      }
    } else if (action === 'delete') {
      deletePreset(presetId);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleDownload();
      }
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        applyDimensions();
      }
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleSidebar, handleDownload, applyDimensions]);

  return (
    <div className={`${inter.variable} min-h-screen bg-background`}>
      <button
        onClick={toggleSidebar}
        className="fixed top-6 right-6 z-[60] p-2 bg-background border border-default rounded-xl hover:bg-surface transition-colors"
        aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        title={`${isSidebarOpen ? 'Fermer' : 'Ouvrir'} le menu (Ctrl/Cmd + B)`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      
      <div className="flex">
        {/* Sidebar */}
        <div 
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed top-0 bottom-0 w-96 border-r border-default bg-background transition-transform duration-300 ease-in-out z-50`}
        >
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-border">
            <div className="p-6 space-y-6">
              <ThemeSwitch />
              
              <div>
                <h3 className="text-lg font-medium text-text">
                  Formats acceptés
                </h3>
                <div className="space-y-4 w-full">
                  {Object.entries(formatInfo).map(([mime, format]) => (
                    <div key={mime} className="bg-surface rounded-lg p-4">
                      <div className="font-mono text-sm bg-surface-hover px-2 py-1 rounded text-text-light inline-block mb-2">
                        {format.name}
                      </div>
                      <p className="text-sm text-text-light break-words">
                        {format.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-text">
                  Raccourcis clavier
                </h3>
                <div className="space-y-2 text-sm text-text-light">
                  <div className="flex justify-between">
                    <span>Ctrl/Cmd + Enter</span>
                    <span>Télécharger</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl/Cmd + A</span>
                    <span>Appliquer dimensions</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ctrl/Cmd + B</span>
                    <span>Toggle sidebar</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Echap</span>
                    <span>Fermer modal</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-text-light">
                <p className="mb-2">
                  <span className="font-medium">Note :</span> Les images seront automatiquement converties dans le format sélectionné.
                </p>
                <p>
                  <span className="font-medium">Taille maximale :</span> 10MB par fichier
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div 
          className={`flex-1 min-h-screen transition-[margin] duration-300 ease-in-out ${
            isSidebarOpen ? 'lg:ml-96' : 'lg:ml-0'
          } w-full relative z-0`}
        >
          <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8 text-center text-text">
              Optimiseur d'images
            </h1>

            <div className="space-y-8">
              <DropZone onFilesDrop={handleFilesDrop} />

              <div className="bg-surface p-8 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Paramètres
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className={selectWrapperClassName}>
                      <label className="block text-sm font-medium text-text">
                        Format
                        <span className="ml-1 text-text-light">ⓘ</span>
                      </label>
                      <div className={selectWrapperClassName}>
                        <select
                          className={selectClassName}
                          value={settings.format}
                          onChange={(e) => updateSettings({ format: e.target.value as 'webp' | 'avif' | 'jpeg' | 'png' })}
                        >
                          {Object.entries(formatInfo).map(([key, info]) => (
                            <option key={key} value={key}>{info.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={selectWrapperClassName}>
                      <label className="block text-sm font-medium text-text">
                        Qualité
                        <span className="ml-1 text-text-light">ⓘ</span>
                      </label>
                      <div className={selectWrapperClassName}>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            className="w-full cursor-pointer"
                            value={settings.quality}
                            onChange={(e) => updateSettings({ quality: Number(e.target.value) })}
                          />
                          <span className="text-sm text-text-light w-12">
                            {settings.quality}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={selectWrapperClassName}>
                      <label className="block text-sm font-medium text-text">
                        Dimensions
                        <span className="ml-1 text-text-light">ⓘ</span>
                      </label>
                      <div className={selectWrapperClassName}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <input
                              type="number"
                              min="1"
                              placeholder="Largeur"
                              className={selectClassName}
                              value={settings.width || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateSettings({
                                  width: value ? Math.max(1, parseInt(value)) : undefined
                                });
                              }}
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              min="1"
                              placeholder="Hauteur"
                              className={selectClassName}
                              value={settings.height || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateSettings({
                                  height: value ? Math.max(1, parseInt(value)) : undefined
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={selectWrapperClassName}>
                      <label className="block text-sm font-medium text-text">
                        Préréglages
                        <span className="ml-1 text-text-light">ⓘ</span>
                      </label>
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <select
                            className={selectClassName}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                              const preset = allPresets[e.target.value as keyof typeof allPresets];
                              if (preset) {
                                setSettings(prev => ({
                                  ...prev,
                                  format: preset.format,
                                  quality: preset.quality,
                                  width: preset.width,
                                  height: preset.height
                                }));
                              }
                            }}
                          >
                            <option value="">Personnalisé</option>
                            <optgroup label="Par défaut">
                              {Object.entries(presetInfo).map(([key, preset]) => (
                                <option key={key} value={key}>{preset.name}</option>
                              ))}
                            </optgroup>
                            {Object.keys(customPresets).length > 0 && (
                              <optgroup label="Personnalisés">
                                {Object.entries(customPresets).map(([key, preset]) => (
                                  <option key={key} value={key}>{preset.name}</option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPreset(null);
                              setNewPresetName('');
                              setShowPresetModal(true);
                            }}
                            className="p-2.5 bg-background border border-default rounded-xl hover:bg-surface transition-colors"
                            title="Sauvegarder les paramètres actuels"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          {Object.keys(customPresets).length > 0 && (
                            <button
                              onClick={() => setShowPresetsManager(true)}
                              className="p-2.5 bg-background border border-default rounded-xl hover:bg-surface transition-colors"
                              title="Gérer les préréglages"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {images.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm"
                      onClick={applyDimensions}
                    >
                      Appliquer les dimensions
                    </button>
                  </div>
                )}
              </div>

              {images.length > 0 && progress < 100 && (
                <div className="relative pt-1 px-4">
                  <div className="mb-2 text-sm text-text-light flex justify-between">
                    <span>Progression</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-xl bg-surface border border-default">
                    <div
                      className="transition-all duration-300 ease-out shadow-lg bg-primary rounded-xl flex items-center justify-center"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="text-white text-xs font-medium px-2 whitespace-nowrap">
                        {Math.round(progress)}%
                      </div>
                    </div>
                  </div>
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
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
                    onClick={applyDimensions}
                  >
                    Appliquer les dimensions
                  </button>
                  <button
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
                    onClick={handleDownload}
                  >
                    Télécharger {images.length > 1 ? 'les images' : "l&apos;image"}
                  </button>
                  {images.length > 1 && (
                    <button
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
                      onClick={handleClearAll}
                    >
                      Tout supprimer
                    </button>
                  )}
                </div>
              )}
            </div>

            {showPresetModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-background p-6 rounded-xl shadow-lg max-w-md w-full mx-4">
                  <h3 className="text-lg font-medium mb-4 text-text">
                    {editingPreset ? 'Modifier le préréglage' : 'Sauvegarder le préréglage'}
                  </h3>
                  <input
                    type="text"
                    placeholder="Nom du préréglage"
                    value={newPresetName}
                    className="w-full p-2 border border-default rounded-xl bg-background text-text mb-4"
                    onChange={(e) => setNewPresetName(e.target.value)}
                  />
                  <div className="flex justify-end gap-4">
                    <button
                      className="px-4 py-2 text-text-light hover:bg-surface rounded-xl transition-colors"
                      onClick={() => {
                        setShowPresetModal(false);
                        setEditingPreset(null);
                        setNewPresetName('');
                      }}
                    >
                      Annuler
                    </button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        if (newPresetName) {
                          if (editingPreset) {
                            editPreset(editingPreset, {
                              name: newPresetName,
                              ...settings
                            });
                          } else {
                            savePreset({
                              name: newPresetName,
                              ...settings
                            });
                          }
                          setShowPresetModal(false);
                          setEditingPreset(null);
                          setNewPresetName('');
                        }
                      }}
                    >
                      {editingPreset ? 'Mettre à jour' : 'Sauvegarder'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showPresetsManager && (
              <PresetManager
                customPresets={customPresets}
                onEdit={(id) => handlePresetAction(id, 'edit')}
                onDelete={(id) => handlePresetAction(id, 'delete')}
                onClose={() => setShowPresetsManager(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
