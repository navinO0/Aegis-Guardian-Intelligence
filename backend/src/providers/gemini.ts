import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider } from './index.js';
import { logger } from '../utils/logger.js';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private genAI: GoogleGenerativeAI;
  private model: string;
  private visionModel: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash', visionModel: string = 'gemini-1.5-flash') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
    this.visionModel = visionModel;
  }

  async initialize(): Promise<void> {}

  async generateText(prompt: string): Promise<string> {
    const start = Date.now();
    logger.info({ model: this.model }, `🧠 Gemini Generation started`);
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - start;
      logger.info({ model: this.model, duration: `${duration}ms` }, `✅ Gemini Generation finished`);
      return text;
    } catch (err: any) {
      logger.error({ model: this.model, error: err.message }, `❌ Gemini Generation failed`);
      throw err;
    }
  }

  async analyzeImage(imageBuffer: Buffer | Buffer[], prompt: string): Promise<string> {
    const start = Date.now();
    const buffers = Array.isArray(imageBuffer) ? imageBuffer : [imageBuffer];
    logger.info({ model: this.visionModel, imageCount: buffers.length }, `👁️ Gemini Vision analysis started`);
    
    try {
      const model = this.genAI.getGenerativeModel({ model: this.visionModel });
      
      const parts = [
        { text: prompt },
        ...buffers.map(buffer => ({
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: 'image/jpeg'
          }
        }))
      ];

      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();
      
      const duration = Date.now() - start;
      logger.info({ model: this.visionModel, duration: `${duration}ms` }, `✅ Gemini Vision analysis finished`);
      return text;
    } catch (err: any) {
      logger.error({ model: this.visionModel, error: err.message }, `❌ Gemini Vision analysis failed`);
      throw err;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const start = Date.now();
    try {
      const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      const duration = Date.now() - start;
      logger.info({ duration: `${duration}ms` }, `🔢 Gemini Embedding finished`);
      return result.embedding.values;
    } catch (err: any) {
      logger.error({ error: err.message }, `❌ Gemini Embedding failed`);
      throw err;
    }
  }

  async embedText(text: string): Promise<number[]> {
    return this.generateEmbedding(text);
  }
}
