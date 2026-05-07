import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import type { AIProvider, AiProviderConfig } from './index.js';
import { OllamaProvider } from './ollama.js';
import { OpenAIProvider } from './openai.js';
import { GeminiProvider } from './gemini.js';
import { AnthropicProvider } from './anthropic.js';

const prisma = new PrismaClient();

export class ProviderManager implements AIProvider {
  private static instance: ProviderManager;
  private activeProvider: AIProvider | null = null;
  private currentConfig: AiProviderConfig | null = null;

  private constructor() {}

  public static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  get name(): string {
    return this.activeProvider?.name || 'Uninitialized';
  }

  async initialize(): Promise<void> {
    await this.loadActiveProvider();
  }

  async loadActiveProvider(): Promise<void> {
    try {
      const activeConfigs = await prisma.aiProvider.findMany({
        where: { isActive: true },
        take: 1
      });

      const config = activeConfigs[0] as unknown as AiProviderConfig;

      if (!config) {
        logger.info('No active AI provider found in DB, falling back to Ollama');
        this.activeProvider = new OllamaProvider();
        this.currentConfig = null;
      } else {
        logger.info({ type: config.type, name: config.name }, '🚀 Activating AI provider from DB');
        this.activeProvider = this.createProvider(config);
        this.currentConfig = config;
      }

      if (this.activeProvider) {
        try {
          await this.activeProvider.initialize();
        } catch (initErr) {
          logger.error({ error: initErr }, `❌ Failed to initialize ${this.activeProvider.name}, falling back to Ollama`);
          this.activeProvider = new OllamaProvider();
          await this.activeProvider.initialize();
        }
      }
    } catch (err) {
      logger.error({ error: err }, '❌ Failed to load active AI provider, using default Ollama');
      this.activeProvider = new OllamaProvider();
      await this.activeProvider.initialize();
    }
  }

  private createProvider(config: AiProviderConfig): AIProvider {
    switch (config.type) {
      case 'openai':
        return new OpenAIProvider(config.apiKey!, config.model, config.baseUrl || undefined, config.visionModel || undefined);
      case 'gemini':
        return new GeminiProvider(config.apiKey!, config.model, config.visionModel || undefined);
      case 'anthropic':
        return new AnthropicProvider(config.apiKey!, config.model, config.visionModel || undefined);
      case 'ollama':
        return new OllamaProvider(config.baseUrl || undefined, config.model, config.visionModel || undefined);
      default:
        return new OllamaProvider();
    }
  }

  async generateText(prompt: string, options?: any): Promise<string> {
    if (!this.activeProvider) await this.initialize();
    return this.activeProvider!.generateText(prompt, options);
  }

  async analyzeImage(imageBuffer: Buffer | Buffer[], prompt: string): Promise<string> {
    if (!this.activeProvider) await this.initialize();
    return this.activeProvider!.analyzeImage(imageBuffer, prompt);
  }

  async embedText(text: string): Promise<number[]> {
    if (!this.activeProvider) await this.initialize();
    try {
      return await this.activeProvider!.embedText(text);
    } catch (err) {
      logger.warn(`Embedding failed for ${this.activeProvider?.name}, falling back to Ollama`);
      const ollama = new OllamaProvider();
      return ollama.embedText(text);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.embedText(text);
  }

  async reload(): Promise<void> {
    await this.loadActiveProvider();
  }
}

export const aiProvider = ProviderManager.getInstance();
