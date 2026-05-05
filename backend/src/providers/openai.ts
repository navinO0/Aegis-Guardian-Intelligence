import OpenAI from 'openai';
import type { AIProvider } from './index.js';
import { logger } from '../utils/logger.js';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o', baseUrl?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl || undefined,
    });
    this.model = model;
  }

  async initialize(): Promise<void> {
    // Basic connectivity check could go here
  }

  async generateText(prompt: string): Promise<string> {
    const start = Date.now();
    logger.info({ model: this.model }, `🧠 OpenAI Generation started`);
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      });
      const duration = Date.now() - start;
      const content = response.choices[0]?.message?.content || '';
      logger.info({ model: this.model, duration: `${duration}ms` }, `✅ OpenAI Generation finished`);
      return content;
    } catch (err: any) {
      logger.error({ model: this.model, error: err.message }, `❌ OpenAI Generation failed`);
      throw err;
    }
  }

  async analyzeImage(imageBuffer: Buffer | Buffer[], prompt: string): Promise<string> {
    const start = Date.now();
    const buffers = Array.isArray(imageBuffer) ? imageBuffer : [imageBuffer];
    logger.info({ model: this.model, imageCount: buffers.length }, `👁️ OpenAI Vision analysis started`);
    
    try {
      const messages: any[] = [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...buffers.map(buffer => ({
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${buffer.toString('base64')}` }
            }))
          ]
        }
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
      });

      const duration = Date.now() - start;
      const content = response.choices[0]?.message?.content || '';
      logger.info({ model: this.model, duration: `${duration}ms` }, `✅ OpenAI Vision analysis finished`);
      return content;
    } catch (err: any) {
      logger.error({ model: this.model, error: err.message }, `❌ OpenAI Vision analysis failed`);
      throw err;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const start = Date.now();
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      const duration = Date.now() - start;
      logger.info({ duration: `${duration}ms` }, `🔢 OpenAI Embedding finished`);
      return response.data[0].embedding;
    } catch (err: any) {
      logger.error({ error: err.message }, `❌ OpenAI Embedding failed`);
      throw err;
    }
  }

  async embedText(text: string): Promise<number[]> {
    return this.generateEmbedding(text);
  }
}
