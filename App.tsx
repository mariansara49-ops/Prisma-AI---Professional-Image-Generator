import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, History, AlertCircle, Key, Wand, Settings2, ExternalLink } from 'lucide-react';
import { Button } from './components/Button';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { ImageCard } from './components/ImageCard';
import { ImageViewer } from './components/ImageViewer';
import { PromptTools } from './components/PromptTools';
import { StylePresets } from './components/StylePresets';
import { generateImage } from './services/geminiService';
import { AspectRatio, GeneratedImage, GenerationConfig, ImageResolution } from './types';

const SURPRISE_PROMPTS = [
  "A majestic floating island with waterfalls falling into the clouds, digital art",
  "Portrait of a futuristic samurai in chrome armor, detailed glowing katana, night city background",
  "Close up of an alien eye reflecting a strange galaxy, hyper-realistic, macro photography",
  "A cozy hobbit hole living room with a warm fireplace and rainy window, watercolor style",
  "An astronaut exploring underwater ruins of a lost civilization, bioluminescent fish",
  "Cyberpunk Venice with neon gondolas and holographic water, synthwave colors"
];

function App() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isPro, setIsPro] = useState(false);
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<{message: string, isKeyError?: boolean} | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

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

  useEffect(() => {
    localStorage.setItem('prisma_images', JSON.stringify(images));
  }, [images]);

  const handleTogglePro = async () => {
    const nextState = !isPro;
    setIsPro(nextState);
    
    if (nextState && window.aistudio?.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }
  };

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setError(null);
    }
  };

  const handleSurpriseMe = () => {
    const randomPrompt = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  const handleAddModifier = (mod: string) => {
    if (!prompt.trim()) {
      setPrompt(mod);
    } else {
      const normalizedPrompt = prompt.toLowerCase();
      const normalizedMod = mod.toLowerCase();
      if (!normalizedPrompt.includes(normalizedMod)) {
        const separator = prompt.trim().endsWith(',') ? ' ' : ', ';
        setPrompt(`${prompt.trim()}${separator}${mod}`);
      }
    }
  };

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
      const msg = err.message || "Failed to generate image.";
      const isKeyError = msg.includes("PRO_KEY_ERROR") || msg.includes("403") || msg.includes("PERMISSION_DENIED");
      
      setError({ 
        message: isKeyError ? "Gemini 3 Pro requires a paid API key. Please ensure your project has billing enabled." : msg,
        isKeyError 
      });
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
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 hidden sm:block">
              Powered by Gemini
            </div>
            {isPro && (
               <button 
                onClick={handleOpenKeyDialog}
                className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
                title="Manage API Key"
               >
                 <Key className="w-4 h-4" />
               </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#161b22] border border-gray-800 rounded-xl p-6 shadow-xl sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center text-white">
                  <Wand2 className="w-5 h-5 mr-2 text-indigo-400" />
                  Create
                </h2>
                <button 
                  onClick={handleSurpriseMe}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center bg-indigo-500/10 px-2 py-1 rounded-md transition-colors"
                >
                  <Wand className="w-3 h-3 mr-1" />
                  Surprise Me
                </button>
              </div>
              
              <StylePresets onSelect={handleAddModifier} />
              <PromptTools onSelectStarter={setPrompt} onAddModifier={handleAddModifier} />

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-400">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your masterpiece..."
                  className="w-full h-32 bg-[#0d1117] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              <div className="mt-6 space-y-3">
                <label className="block text-sm font-medium text-gray-400">Aspect Ratio</label>
                <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className={`w-4 h-4 transition-colors ${isPro ? 'text-indigo-400' : 'text-gray-500'}`} />
                    <span className="text-sm font-medium text-gray-400">Pro Mode Settings</span>
                  </div>
                  <button 
                    onClick={handleTogglePro}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPro ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPro ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {isPro && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                     <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                       <p className="text-xs text-indigo-300 leading-relaxed">
                         <strong>Gemini 3 Pro</strong> requires a paid project key. 
                         <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="ml-1 underline inline-flex items-center">
                           Billing Docs <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                         </a>
                       </p>
                     </div>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-400 mb-2">Resolution Quality</label>
                       <div className="grid grid-cols-3 gap-2">
                         {['1K', '2K', '4K'].map((res) => (
                           <button
                             key={res}
                             onClick={() => setResolution(res as ImageResolution)}
                             className={`py-2 px-1 rounded-lg border transition-all text-xs font-bold ${
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
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={isGenerating} 
                  disabled={!prompt.trim()}
                  className="w-full py-3 text-lg"
                >
                  {isGenerating ? 'Dreaming...' : 'Generate Image'}
                </Button>
                {error && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex flex-col text-red-200 text-sm">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{error.message}</span>
                    </div>
                    {error.isKeyError && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button 
                          onClick={handleOpenKeyDialog}
                          className="text-xs text-indigo-300 hover:text-white flex items-center bg-white/5 py-1 px-2 rounded"
                        >
                          <Key className="w-3 h-3 mr-1" />
                          Switch API Key
                        </button>
                        <a 
                          href="https://ai.google.dev/gemini-api/docs/billing" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-white flex items-center bg-white/5 py-1 px-2 rounded"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Billing Docs
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <History className="w-6 h-6 mr-3 text-gray-500" />
                  Gallery
                </h2>
                {images.length > 0 && (
                  <button onClick={handleClearHistory} className="text-xs text-gray-500 hover:text-red-400">
                    Clear History
                  </button>
                )}
             </div>

             {images.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-gray-800 rounded-xl bg-[#161b22]/50 text-gray-500">
                 <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                 <p className="text-lg font-medium">No images yet</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {images.map((img) => (
                   <ImageCard key={img.id} image={img} onDelete={handleDeleteImage} onView={setSelectedImage} />
                 ))}
               </div>
             )}
          </div>
        </div>
      </main>

      {selectedImage && (
        <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}

export default App;