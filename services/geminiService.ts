import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, GeneratedImage } from "../types";

// Helper to ensure we have the right key for Pro models
const ensureApiKey = async (isPro: boolean): Promise<string | undefined> => {
  if (isPro) {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        if (window.aistudio.openSelectKey) {
          await window.aistudio.openSelectKey();
          // Assume success after dialog close/interaction, strict check might need retry
        }
      }
    }
  }
  return process.env.API_KEY;
};

export const generateImage = async (config: GenerationConfig): Promise<GeneratedImage> => {
  await ensureApiKey(config.isPro);
  
  // Re-initialize to pick up potential new key from local storage/env if updated by window.aistudio
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = config.isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const imageConfig: any = {
    aspectRatio: config.aspectRatio,
  };

  if (config.isPro && config.resolution) {
    imageConfig.imageSize = config.resolution;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: config.prompt }],
      },
      config: {
        imageConfig: imageConfig,
      },
    });

    let imageUrl = '';

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          // Gemini returns raw data, we need to construct the data URI. 
          // Default mimeType is usually image/jpeg or image/png depending on model, 
          // but the part.inlineData.mimeType should be present.
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
          break; // Found the image
        }
      }
    }

    if (!imageUrl) {
        throw new Error("No image data found in response");
    }

    return {
      id: crypto.randomUUID(),
      url: imageUrl,
      prompt: config.prompt,
      aspectRatio: config.aspectRatio,
      timestamp: Date.now(),
      model: modelName,
    };

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // Handling specific error cases if needed
    if (error.message?.includes("Requested entity was not found") && config.isPro) {
       // Reset key logic could go here, but for now just throw
       throw new Error("API Key issue or Model not found. Please try selecting a key again.");
    }
    throw error;
  }
};

// Global type augmentation for window.aistudio
declare global {
  // We augment the interface that window.aistudio is already declared as.
  // This avoids "Subsequent property declarations must have the same type" error.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
