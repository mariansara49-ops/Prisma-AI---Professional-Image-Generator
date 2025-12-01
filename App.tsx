import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, History, AlertCircle } from 'lucide-react';
import { Button } from './components/Button';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ImageCard } from './components/ImageCard';
import { ImageViewer } from './components/ImageViewer';
import { generateImage } from './services/geminiService';
import { AspectRatio, GeneratedImage, GenerationConfig, ImageResolution } from './types';

function App() {
  // State
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isPro, setIsPro] = useState(false);
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image History
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('prisma_images');
    if (saved) {
      try {
        setImages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('prisma_images', JSON.stringify(images));
  }, [images]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    const config: GenerationConfig = {
      prompt,
      aspectRatio,
      isPro,
      resolution: isPro ? resolution : undefined
    };

    try {
      const newImage = await generateImage(config);
      setImages(prev => [newImage, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) setSelectedImage(null);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setImages([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0d1117]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Prisma AI
            </span>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Powered by Gemini
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Controls - Left Side (Desktop) or Top (Mobile) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-xl sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Wand2 className="w-5 h-5 mr-2 text-indigo-400" />
                Create
              </h2>
              
              {/* Prompt Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-400">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create... e.g. 'A futuristic city made of crystal at sunset'"
                  className="w-full h-32 bg-[#0d1117] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Aspect Ratio */}
              <div className="mt-6 space-y-3">
                <label className="block text-sm font-medium text-gray-400">
                  Aspect Ratio
                </label>
                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
              </div>

              {/* Advanced Settings Toggle */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-400">Pro Mode</span>
                  <button 
                    onClick={() => setIsPro(!isPro)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPro ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPro ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {isPro && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                     <p className="text-xs text-gray-500 mb-2">
                       Uses <strong>Gemini 3 Pro</strong>. Slower but higher fidelity. 
                       <br/>
                       Requires connecting your own Google Cloud paid project key.
                     </p>
                     <label className="block text-sm font-medium text-gray-400">Resolution</label>
                     <div className="flex gap-2">
                       {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
                         <button
                           key={res}
                           onClick={() => setResolution(res)}
                           className={`flex-1 py-1.5 text-xs font-medium rounded border ${
                             resolution === res 
                               ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                               : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                           }`}
                         >
                           {res}
                         </button>
                       ))}
                     </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="mt-6">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={isGenerating} 
                  disabled={!prompt.trim()}
                  className="w-full py-3 text-lg shadow-lg shadow-indigo-500/20"
                >
                  {isGenerating ? 'Dreaming...' : 'Generate Image'}
                </Button>
                {error && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-start text-red-200 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gallery - Right Side */}
          <div className="lg:col-span-8">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <History className="w-6 h-6 mr-3 text-gray-500" />
                  Gallery
                </h2>
                {images.length > 0 && (
                  <button 
                    onClick={handleClearHistory}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Clear History
                  </button>
                )}
             </div>

             {images.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-gray-800 rounded-xl bg-[#161b22]/50 text-gray-500">
                 <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                 <p className="text-lg font-medium">No images yet</p>
                 <p className="text-sm opacity-60">Enter a prompt and hit generate to start creating.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {images.map((img) => (
                   <ImageCard 
                      key={img.id} 
                      image={img} 
                      onDelete={handleDeleteImage} 
                      onView={setSelectedImage}
                   />
                 ))}
               </div>
             )}
          </div>
        </div>
      </main>

      {/* Full Screen Viewer */}
      {selectedImage && (
        <ImageViewer 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </div>
  );
}

export default App;