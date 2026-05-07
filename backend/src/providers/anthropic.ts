import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from './index.js';
import { logger } from '../utils/logger.js';

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic';
  private client: Anthropic;
  private model: string;
  private visionModel: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20240620', visionModel: string = 'claude-3-5-sonnet-20240620') {
    this.client = new Anthropic({
      apiKey,
    });
    this.model = model;
    this.visionModel = visionModel;
  }

  async initialize(): Promise<void> {}

  async generateText(prompt: string): Promise<string> {
    const start = Date.now();
    logger.info({ model: this.model }, `🧠 Anthropic Generation started`);
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });
      const duration = Date.now() - start;
      const content = (response.content[0] as any).text || '';
      logger.info({ model: this.model, duration: `${duration}ms` }, `✅ Anthropic Generation finished`);
      return content;
    } catch (err: any) {
      logger.error({ model: this.model, error: err.message }, `❌ Anthropic Generation failed`);
      throw err;
    }
  }

  async analyzeImage(imageBuffer: Buffer | Buffer[], prompt: string): Promise<string> {
    const start = Date.now();
    const buffers = Array.isArray(imageBuffer) ? imageBuffer : [imageBuffer];
    logger.info({ model: this.visionModel, imageCount: buffers.length }, `👁️ Anthropic Vision analysis started`);
    
    try {
      const content: any[] = buffers.map(buffer => ({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: buffer.toString('base64'),
        },
      }));

      content.push({ type: 'text', text: prompt });

      const response = await this.client.messages.create({
        model: this.visionModel,
        max_tokens: 4096,
        messages: [{ role: 'user', content }],
      });

      const duration = Date.now() - start;
      const text = (response.content[0] as any).text || '';
      logger.info({ model: this.visionModel, duration: `${duration}ms` }, `✅ Anthropic Vision analysis finished`);
      return text;
    } catch (err: any) {
      logger.error({ model: this.visionModel, error: err.message }, `❌ Anthropic Vision analysis failed`);
      throw err;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Anthropic doesn't have an embedding API currently.
    // We might need to use a fallback or another provider for embeddings if Anthropic is active.
    // For now, throw error or return empty.
    logger.warn('Anthropic does not support native embeddings. Fallback required.');
    throw new Error('Anthropic does not support embeddings.');
  }

  async embedText(text: string): Promise<number[]> {
    return this.generateEmbedding(text);
  }
}
