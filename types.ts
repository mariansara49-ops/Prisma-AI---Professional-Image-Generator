export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ImageResolution = "1K" | "2K" | "4K";

export interface GenerationConfig {
  prompt: string;
  aspectRatio: AspectRatio;
  isPro: boolean;
  resolution?: ImageResolution;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  timestamp: number;
  model: string;
}

export interface GenerationError {
  message: string;
  code?: string;
}