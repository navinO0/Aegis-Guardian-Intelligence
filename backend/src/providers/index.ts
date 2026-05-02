export interface AIProvider {
  name: string;
  generateText(prompt: string, options?: any): Promise<string>;
  analyzeImage(imageBuffer: Buffer | Buffer[], prompt: string): Promise<string>;
  embedText(text: string): Promise<number[]>;
}

export interface VoiceProvider {
  name: string;
  textToSpeech(text: string, options?: any): Promise<Buffer>;
  speechToText(audioStream: any): Promise<string>;
}
