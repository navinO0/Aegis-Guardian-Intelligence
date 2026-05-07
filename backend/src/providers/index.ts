export interface AIProvider {
  name: string;
  initialize(): Promise<void>;
  generateText(prompt: string, options?: any): Promise<string>;
  analyzeImage(imageBuffer: Buffer | Buffer[], prompt: string): Promise<string>;
  embedText(text: string): Promise<number[]>;
  generateEmbedding(text: string): Promise<number[]>;
}

export interface VoiceProvider {
  name: string;
  textToSpeech(text: string, options?: any): Promise<Buffer>;
  speechToText(audioStream: any): Promise<string>;
}

export interface AiProviderConfig {
  id: string;
  name: string;
  type: 'gemini' | 'openai' | 'anthropic' | 'ollama';
  baseUrl?: string | null;
  apiKey?: string | null;
  model: string;
  visionModel?: string | null;
  isActive: boolean;
  config?: any;
}
