import React from 'react';
import { Square, RectangleHorizontal, RectangleVertical } from 'lucide-react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ value, onChange }) => {
  const ratios: { label: string; value: AspectRatio; icon: React.ReactNode }[] = [
    { label: "Square (1:1)", value: "1:1", icon: <Square className="w-4 h-4" /> },
    { label: "Landscape (16:9)", value: "16:9", icon: <RectangleHorizontal className="w-4 h-4" /> },
    { label: "Portrait (9:16)", value: "9:16", icon: <RectangleVertical className="w-4 h-4" /> },
    { label: "Landscape (4:3)", value: "4:3", icon: <RectangleHorizontal className="w-4 h-4" /> },
    { label: "Portrait (3:4)", value: "3:4", icon: <RectangleVertical className="w-4 h-4" /> },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {ratios.map((ratio) => (
        <button
          key={ratio.value}
          onClick={() => onChange(ratio.value)}
          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
            value === ratio.value
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750 hover:border-gray-600'
          }`}
        >
          {ratio.icon}
          <span className="text-xs mt-2">{ratio.value}</span>
        </button>
      ))}
    </div>
  );
};