import React, { useState } from 'react';

interface Preset extends ImageSettings {
  name: string;
  id: string;
}

export function PresetManager({ onSelect }: { onSelect: (preset: Preset) => void }) {
  const [presets, setPresets] = useState<Preset[]>(() => {
    const saved = localStorage.getItem('custom-presets');
    return saved ? JSON.parse(saved) : defaultPresets;
  });

  const savePreset = (settings: ImageSettings, name: string) => {
    const newPreset = { ...settings, name, id: Date.now().toString() };
    const newPresets = [...presets, newPreset];
    setPresets(newPresets);
    localStorage.setItem('custom-presets', JSON.stringify(newPresets));
  };

  return (
    <div>
      <select onChange={(e) => {
        const preset = presets.find(p => p.id === e.target.value);
        if (preset) onSelect(preset);
      }}>
        {presets.map(preset => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>
      {/* Add UI for saving new presets */}
    </div>
  );
} 