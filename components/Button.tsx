import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip?: string;
}

export function Button({ tooltip, children, ...props }: ButtonProps) {
  return (
    <div className="relative group">
      <button {...props}>
        {children}
      </button>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded p-2 whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
}

// Utilisation dans pages/index.tsx
<Button
  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
  onClick={applyDimensions}
  tooltip="Ctrl/Cmd + A"
>
  Appliquer les dimensions
</Button> 