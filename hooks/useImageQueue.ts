import React, { useState, useEffect } from 'react';

export function useImageQueue(maxConcurrent = 3) {
  const [queue, setQueue] = useState<File[]>([]);
  const [processing, setProcessing] = useState<File[]>([]);

  const addToQueue = (files: File[]) => {
    setQueue(prev => [...prev, ...files]);
  };

  useEffect(() => {
    if (queue.length === 0 || processing.length >= maxConcurrent) return;

    const nextFile = queue[0];
    setQueue(prev => prev.slice(1));
    setProcessing(prev => [...prev, nextFile]);

    // Process file...
  }, [queue, processing]);

  return { addToQueue };
} 