import React, { useState } from 'react';
import { Download, Maximize2, Trash2 } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageCardProps {
  image: GeneratedImage;
  onDelete: (id: string) => void;
  onView: (image: GeneratedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onDelete, onView }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `prisma-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(image.id);
  }

  return (
    <div 
      className="group relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700 aspect-square cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView(image)}
    >
      <img 
        src={image.url} 
        alt={image.prompt} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm font-medium line-clamp-2 mb-3 drop-shadow-md">
            {image.prompt}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
              {image.aspectRatio} • {image.model.includes('pro') ? 'PRO' : 'FAST'}
            </span>
            <div className="flex gap-2">
               <button 
                onClick={handleDownload}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 backdrop-blur-sm transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* View Icon (always visible on hover in center) */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
         <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm">
            <Maximize2 className="w-6 h-6 text-white" />
         </div>
      </div>
    </div>
  );
};