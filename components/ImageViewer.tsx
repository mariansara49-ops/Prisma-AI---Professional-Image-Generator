import React from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageViewerProps {
  image: GeneratedImage | null;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `prisma-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-50"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="max-w-7xl w-full h-full flex flex-col md:flex-row gap-6 items-center justify-center">
        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center w-full h-full overflow-hidden">
          <img 
            src={image.url} 
            alt={image.prompt} 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Info Panel */}
        <div className="w-full md:w-80 flex-shrink-0 bg-gray-900/80 border border-gray-800 rounded-xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Image Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Prompt</label>
              <div className="mt-1 p-3 bg-gray-800 rounded-lg text-sm text-gray-300 leading-relaxed max-h-40 overflow-y-auto border border-gray-700">
                {image.prompt}
              </div>
              <button 
                onClick={handleCopyPrompt}
                className="mt-2 text-xs flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? 'Copied' : 'Copy prompt'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Ratio</label>
                <p className="text-white mt-1 font-mono text-sm">{image.aspectRatio}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Model</label>
                <p className="text-white mt-1 font-mono text-sm break-words">
                    {image.model === 'gemini-3-pro-image-preview' ? 'Gemini 3 Pro' : 'Gemini 2.5 Flash'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <button 
                onClick={handleDownload}
                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Original
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};