import { useState, useEffect } from 'react';

interface Preset {
  id: string;
  name: string;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  quality: number;
  width?: number;
  height?: number;
}

const defaultPresets = {
  web: {
    id: 'web',
    name: 'Web',
    format: 'webp',
    quality: 80,
    width: 1920,
    description: 'Optimisé pour les images pleine largeur sur desktop'
  },
  thumbnail: {
    id: 'thumbnail',
    name: 'Vignette',
    format: 'webp',
    quality: 60,
    width: 300,
    description: 'Pour les miniatures et aperçus'
  },
  mobile: {
    id: 'mobile',
    name: 'Mobile',
    format: 'webp',
    quality: 75,
    width: 828,
    description: 'Adapté aux écrans mobiles'
  }
} as const;

export function usePresets() {
  const [customPresets, setCustomPresets] = useState<Record<string, Preset>>({});

  // Charger les préréglages personnalisés au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('custom-presets');
    if (saved) {
      setCustomPresets(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder un nouveau préréglage
  const savePreset = (preset: Omit<Preset, 'id'>) => {
    const id = Date.now().toString();
    const newPreset = { ...preset, id };
    setCustomPresets(prev => {
      const updated = { ...prev, [id]: newPreset };
      localStorage.setItem('custom-presets', JSON.stringify(updated));
      return updated;
    });
  };

  // Supprimer un préréglage
  const deletePreset = (id: string) => {
    setCustomPresets(prev => {
      const updated = { ...prev };
      delete updated[id];
      localStorage.setItem('custom-presets', JSON.stringify(updated));
      return updated;
    });
  };

  // Éditer un préréglage existant
  const editPreset = (id: string, updates: Partial<Omit<Preset, 'id'>>) => {
    setCustomPresets(prev => {
      if (!prev[id]) return prev;
      const updated = {
        ...prev,
        [id]: { ...prev[id], ...updates }
      };
      localStorage.setItem('custom-presets', JSON.stringify(updated));
      return updated;
    });
  };

  return {
    defaultPresets,
    customPresets,
    savePreset,
    deletePreset,
    editPreset,
    allPresets: { ...defaultPresets, ...customPresets }
  };
} 