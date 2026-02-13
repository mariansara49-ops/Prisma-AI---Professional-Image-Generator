import React from 'react';
import { Palette, Camera, Brush, Zap, Ghost, Box, Laptop, Grid3X3, Film, PenTool } from 'lucide-react';

interface StylePreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  modifier: string;
}

const STYLES: StylePreset[] = [
  { id: 'realistic', name: 'Realistic', icon: <Camera className="w-4 h-4" />, modifier: 'photorealistic, highly detailed, 8k resolution' },
  { id: 'oil', name: 'Oil Painting', icon: <Brush className="w-4 h-4" />, modifier: 'oil painting, thick brushstrokes, canvas texture' },
  { id: 'watercolor', name: 'Watercolor', icon: <Palette className="w-4 h-4" />, modifier: 'watercolor painting, soft edges, paper texture' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: <Zap className="w-4 h-4" />, modifier: 'cyberpunk style, neon lights, futuristic, synthwave' },
  { id: 'anime', name: 'Anime', icon: <Ghost className="w-4 h-4" />, modifier: 'anime style, vibrant colors, cel shaded' },
  { id: '3d', name: '3D Render', icon: <Box className="w-4 h-4" />, modifier: '3D render, Unreal Engine 5, Octane render, C4D' },
  { id: 'pixel', name: 'Pixel Art', icon: <Grid3X3 className="w-4 h-4" />, modifier: 'pixel art, 16-bit, retro gaming style' },
  { id: 'sketch', name: 'Sketch', icon: <PenTool className="w-4 h-4" />, modifier: 'pencil sketch, charcoal, hand-drawn, rough lines' },
  { id: 'popart', name: 'Pop Art', icon: <Laptop className="w-4 h-4" />, modifier: 'pop art style, Andy Warhol, bold colors, dots' },
  { id: 'cinematic', name: 'Cinematic', icon: <Film className="w-4 h-4" />, modifier: 'cinematic lighting, wide shot, movie still, dramatic' },
];

interface StylePresetsProps {
  onSelect: (modifier: string) => void;
}

export const StylePresets: React.FC<StylePresetsProps> = ({ onSelect }) => {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3 h-3 text-indigo-400" />
          Art Styles
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.modifier)}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-800/40 border border-gray-700 hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all group"
            title={style.name}
          >
            <div className="mb-1 text-gray-400 group-hover:text-indigo-400 transition-colors">
              {style.icon}
            </div>
            <span className="text-[10px] font-medium text-gray-300 group-hover:text-white truncate w-full text-center">
              {style.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};