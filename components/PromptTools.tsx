import React from 'react';
import { Sparkles, Palette, Zap } from 'lucide-react';

interface PromptToolsProps {
  onSelectStarter: (prompt: string) => void;
  onAddModifier: (modifier: string) => void;
}

const STARTERS = [
  "A cyberpunk cat wearing neon goggles on a skyscraper",
  "An ancient library hidden inside a giant hollow tree",
  "A futuristic space station orbiting a purple gas giant",
  "A majestic phoenix made of liquid gold rising from ashes",
  "A tiny cottage in a glass bottle on a moonlit beach",
  "Steampunk mechanical dragon breathing blue fire"
];

const MODIFIERS = [
  { category: "Styles", items: ["Photorealistic", "Cyberpunk", "Studio Ghibli", "Oil Painting", "Synthwave", "Double Exposure"] },
  { category: "Lighting", items: ["Golden Hour", "Cinematic Lighting", "Neon Glow", "Soft Bokeh", "Volumetric Fog"] },
  { category: "Quality", items: ["8k Resolution", "Intricate Detail", "Hyper-realistic", "Unreal Engine 5", "Masterpiece"] }
];

export const PromptTools: React.FC<PromptToolsProps> = ({ onSelectStarter, onAddModifier }) => {
  return (
    <div className="space-y-4 mb-4">
      {/* Starters Section */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Prompt Starters
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {STARTERS.map((starter, i) => (
            <button
              key={i}
              onClick={() => onSelectStarter(starter)}
              className="flex-shrink-0 px-3 py-1.5 bg-gray-800/50 hover:bg-indigo-600/20 border border-gray-700 hover:border-indigo-500/50 rounded-full text-xs text-gray-300 hover:text-indigo-200 transition-all"
            >
              {starter.slice(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Modifiers Section */}
      <div className="space-y-3">
        {MODIFIERS.map((group) => (
          <div key={group.category}>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {group.category === "Styles" ? <Palette className="w-3 h-3 text-pink-400" /> : <Zap className="w-3 h-3 text-yellow-400" />}
              {group.category}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <button
                  key={item}
                  onClick={() => onAddModifier(item)}
                  className="px-2 py-1 bg-[#0d1117] hover:bg-gray-700 border border-gray-800 rounded text-[10px] font-medium text-gray-400 hover:text-white transition-colors"
                >
                  + {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};