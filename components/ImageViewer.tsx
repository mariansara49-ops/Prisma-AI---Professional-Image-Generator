import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Download, Copy, Check, RotateCw, Sun, Contrast, Ghost, Palette, RefreshCcw, Save, Sparkles, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageViewerProps {
  image: GeneratedImage | null;
  onClose: () => void;
}

interface EditState {
  rotation: number;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  zoom: number;
}

const DEFAULT_EDIT_STATE: EditState = {
  rotation: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  zoom: 1,
};

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [editState, setEditState] = useState<EditState>(DEFAULT_EDIT_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDist = useRef<number | null>(null);

  if (!image) return null;

  const isEdited = editState.rotation !== 0 || 
                   editState.brightness !== 100 || 
                   editState.contrast !== 100 || 
                   editState.grayscale !== 0 || 
                   editState.sepia !== 0;

  const handleDownloadOriginal = () => {
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

  const handleRotate = () => {
    setEditState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const handleReset = () => {
    setEditState(DEFAULT_EDIT_STATE);
  };

  const updateZoom = useCallback((delta: number) => {
    setEditState(prev => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom + delta, 0.5), 5)
    }));
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    updateZoom(delta);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      touchStartDist.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const delta = (dist - touchStartDist.current) / 100;
      updateZoom(delta);
      touchStartDist.current = dist;
    }
  };

  const handleSaveEdited = async () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;

    img.onload = () => {
      const isVertical = editState.rotation === 90 || editState.rotation === 270;
      canvas.width = isVertical ? img.height : img.width;
      canvas.height = isVertical ? img.width : img.height;

      ctx.filter = `
        brightness(${editState.brightness}%) 
        contrast(${editState.contrast}%) 
        saturate(${editState.saturate}%) 
        grayscale(${editState.grayscale}%) 
        sepia(${editState.sepia}%)
      `;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((editState.rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `prisma-edited-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  const handleSmartDownload = () => {
    if (isEdited) {
      handleSaveEdited();
    } else {
      handleDownloadOriginal();
    }
  };

  const filterStyle = {
    filter: `brightness(${editState.brightness}%) contrast(${editState.contrast}%) saturate(${editState.saturate}%) grayscale(${editState.grayscale}%) sepia(${editState.sepia}%)`,
    transform: `rotate(${editState.rotation}deg) scale(${editState.zoom})`,
    transition: touchStartDist.current ? 'none' : 'transform 0.3s ease-out, filter 0.2s ease-out',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-50 bg-black/50 rounded-full"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="max-w-7xl w-full h-full flex flex-col md:flex-row gap-6 items-center justify-center pt-12 md:pt-0">
        
        {/* Image Container */}
        <div 
          ref={containerRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="flex-1 flex items-center justify-center w-full h-full overflow-hidden relative cursor-zoom-in"
        >
          {/* Zoom Level Badge */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700 text-xs font-mono text-indigo-400 flex items-center gap-2 z-10">
            <Search className="w-3.5 h-3.5" />
            {Math.round(editState.zoom * 100)}%
          </div>

          <div className="relative group">
            <img 
              ref={imageRef}
              src={image.url} 
              alt={image.prompt} 
              style={filterStyle}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl transition-transform"
            />
          </div>
          
          {/* Floating Quick Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-gray-900/80 backdrop-blur-md p-2 rounded-full border border-gray-700 shadow-2xl transition-transform hover:scale-105">
            <button onClick={() => updateZoom(-0.2)} className="p-2 text-gray-400 hover:text-indigo-400 transition-colors" title="Zoom Out">
              <ZoomOut className="w-5 h-5" />
            </button>
            <button onClick={() => updateZoom(0.2)} className="p-2 text-gray-400 hover:text-indigo-400 transition-colors" title="Zoom In">
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px bg-gray-700 mx-1" />
            <button onClick={handleRotate} className="p-2 text-gray-400 hover:text-indigo-400 transition-colors" title="Rotate 90°">
              <RotateCw className="w-5 h-5" />
            </button>
            <div className="w-px bg-gray-700 mx-1" />
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className={`p-2 transition-colors ${isEditing ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
              title="Toggle Filters"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button onClick={handleReset} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Reset All">
              <RefreshCcw className="w-5 h-5" />
            </button>
            <div className="w-px bg-gray-700 mx-1" />
            <button onClick={handleSmartDownload} className="p-2 text-indigo-400 hover:text-white transition-colors" title="Download Current View">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full md:w-96 flex-shrink-0 bg-gray-900/90 border border-gray-800 rounded-2xl flex flex-col backdrop-blur-2xl shadow-2xl h-fit max-h-[90vh] overflow-y-auto no-scrollbar">
          
          <div className="flex border-b border-gray-800">
            <button 
              onClick={() => setIsEditing(false)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${!isEditing ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Info
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${isEditing ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Edit
            </button>
          </div>

          <div className="p-6 space-y-6">
            {!isEditing ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3" /> Original Prompt
                  </label>
                  <div className="p-4 bg-black/40 rounded-xl text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto border border-gray-800/50 scrollbar-thin">
                    {image.prompt}
                  </div>
                  <button 
                    onClick={handleCopyPrompt}
                    className="mt-3 text-[11px] font-medium flex items-center text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-400/10 px-3 py-1.5 rounded-lg w-fit"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                    {copied ? 'Copied' : 'Copy Prompt'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Ratio</label>
                    <p className="text-white font-mono text-sm">{image.aspectRatio}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Zoom</label>
                    <p className="text-indigo-400 font-mono text-sm">{Math.round(editState.zoom * 100)}%</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleDownloadOriginal}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Download className="w-5 h-5" />
                    Download Original
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-4">
                  {/* Zoom Slider in Edit Tab */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-gray-400 flex items-center gap-2"><Search className="w-3.5 h-3.5" /> Zoom Level</span>
                      <span className="text-indigo-400">{Math.round(editState.zoom * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="5" step="0.1" 
                      value={editState.zoom} 
                      onChange={(e) => setEditState(prev => ({ ...prev, zoom: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-gray-400 flex items-center gap-2"><Sun className="w-3.5 h-3.5" /> Brightness</span>
                      <span className="text-indigo-400">{editState.brightness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" step="1" 
                      value={editState.brightness} 
                      onChange={(e) => setEditState(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-gray-400 flex items-center gap-2"><Contrast className="w-3.5 h-3.5" /> Contrast</span>
                      <span className="text-indigo-400">{editState.contrast}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" step="1" 
                      value={editState.contrast} 
                      onChange={(e) => setEditState(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => setEditState(prev => ({ ...prev, grayscale: prev.grayscale === 100 ? 0 : 100 }))}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${editState.grayscale === 100 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                    >
                      <Ghost className="w-3.5 h-3.5" /> B&W
                    </button>
                    <button 
                      onClick={() => setEditState(prev => ({ ...prev, sepia: prev.sepia === 100 ? 0 : 100 }))}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all ${editState.sepia === 100 ? 'bg-amber-600 border-amber-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                    >
                      <Palette className="w-3.5 h-3.5" /> Sepia
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-800 flex flex-col gap-3">
                  <button 
                    onClick={handleSaveEdited}
                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Save className="w-5 h-5" />
                    Save Edited Version
                  </button>
                  <button 
                    onClick={handleReset}
                    className="w-full py-2 text-[11px] font-bold text-gray-500 hover:text-red-400 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                  >
                    <RefreshCcw className="w-3 h-3" /> Reset Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
