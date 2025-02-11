interface StatsProps {
  images: ImageInfo[];
}

export function Stats({ images }: StatsProps) {
  const totalOriginalSize = images.reduce((acc, img) => acc + img.originalSize, 0);
  const totalOptimizedSize = images.reduce((acc, img) => acc + (img.optimizedSize || 0), 0);
  const averageReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100;

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Taille originale</h3>
        <p className="text-2xl font-bold">{(totalOriginalSize / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Taille optimisée</h3>
        <p className="text-2xl font-bold">{(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Réduction moyenne</h3>
        <p className="text-2xl font-bold">{averageReduction.toFixed(1)}%</p>
      </div>
    </div>
  );
} 