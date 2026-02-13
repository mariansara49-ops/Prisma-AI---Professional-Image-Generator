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
        }
      }
    }
  }
  return process.env.API_KEY;
};

export const generateImage = async (config: GenerationConfig): Promise<GeneratedImage> => {
  await ensureApiKey(config.isPro);
  
  // Re-initialize right before use to pick up the latest key from the dialog
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
        // Removed systemInstruction as it is not strictly supported/required for these specific image models
        imageConfig: imageConfig,
      },
    });

    let imageUrl = '';
    let textResponse = '';

    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No candidates returned. The prompt might have been blocked or the model is busy.");
    }

    const candidate = response.candidates[0];

    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
          break; 
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!imageUrl) {
        if (candidate.finishReason === 'SAFETY') {
            throw new Error("Content blocked by safety filters. Please try a different prompt.");
        }
        if (textResponse) {
            throw new Error(textResponse);
        }
        throw new Error(`Generation failed. Reason: ${candidate.finishReason || 'Unknown'}`);
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
    
    // Convert error to string for robust matching, handling both object and string errors
    const errorStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
    
    // Explicitly check for 403 or PERMISSION_DENIED which indicates project/key issues
    if (errorStr.includes("PERMISSION_DENIED") || errorStr.includes("403") || errorStr.includes("not found")) {
       throw new Error("PRO_KEY_ERROR: The selected API key does not have permission for Gemini 3 Pro. Ensure your GCP project has billing enabled and the Generative Language API is active.");
    }
    
    throw error;
  }
};

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}