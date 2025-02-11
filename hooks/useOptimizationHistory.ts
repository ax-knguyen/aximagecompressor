import React, { useState, useEffect } from 'react';
import type { ImageSettings } from '../types/settings';
import type { ImageInfo } from '../types/image';

interface OptimizationRecord {
  date: string;
  imagesCount: number;
  totalOriginalSize: number;
  totalOptimizedSize: number;
  settings: ImageSettings;
}

export function useOptimizationHistory() {
  const [history, setHistory] = useState<OptimizationRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('optimization-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const addToHistory = (record: OptimizationRecord) => {
    const newHistory = [...history, record];
    setHistory(newHistory);
    localStorage.setItem('optimization-history', JSON.stringify(newHistory));
  };

  return { history, addToHistory };
} 