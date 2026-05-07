import axios from 'axios';
import { exec } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { AIProvider } from './index.js';
import { logger } from '../utils/logger.js';
import { ImageService } from '../services/image.service.js';

export class OllamaProvider implements AIProvider {
  name = 'Ollama';
  private host: string;
  private model: string;
  private visionModel: string;
  private fallbackVisionModel: string;
  private embedModel: string;
  private hostAvailable: boolean | null = null;
  public imageService: ImageService;

  constructor(
    host: string = process.env.OLLAMA_HOST || 'http://localhost:11434',
    chatModel: string = process.env.LLM_MODEL || 'qwen2.5:7b',
    visionModel: string = process.env.VISION_MODEL || 'moondream',
    embedModel: string = process.env.EMBED_MODEL || 'nomic-embed-text'
  ) {
    this.host = host;
    this.model = chatModel;
    this.visionModel = visionModel;
    this.embedModel = embedModel;
    this.fallbackVisionModel = 'moondream';
    this.imageService = new ImageService();
  }

  async initialize(): Promise<void> {
    this.hostAvailable = await this.checkHostAvailable();
    const models = [this.model, this.visionModel, this.embedModel, this.fallbackVisionModel];
    await Promise.all(models.map(m => this.ensureModelInstalled(m)));
  }

  private async checkHostAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.host}/api/tags`, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  private async ensureModelInstalled(model: string): Promise<void> {
    try {
      const res = await axios.get(`${this.host}/api/tags`, { timeout: 10000 });
      const installed = res.data.models?.map((m: any) => m.name) || [];
      if (installed.some((name: string) => name === model || name.startsWith(`${model}:`))) {
        return;
      }
    } catch (err) {}

    try {
      if (this.hostAvailable) {
        axios.post(`${this.host}/api/pull`, { name: model, stream: false }, { timeout: 900000 });
      }
    } catch (err: any) {}
  }

  async generateText(prompt: string): Promise<string> {
    return this.tryGenerate(this.model, prompt);
  }

  async analyzeImage(imageBuffer: Buffer | Buffer[], prompt: string): Promise<string> {
    const buffers = Array.isArray(imageBuffer) ? imageBuffer : [imageBuffer];
    const optimizedBuffers = await Promise.all(buffers.map(b => this.imageService.optimizeForAi(b)));
    
    try {
      return await this.tryGenerateWithImage(this.visionModel, prompt, optimizedBuffers);
    } catch (err: any) {
      return await this.tryGenerateWithImage(this.fallbackVisionModel, prompt, optimizedBuffers);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const start = Date.now();
    logger.info({ text: text.substring(0, 100) + '...' }, `🔢 AI Embedding started`);
    try {
      const response = await axios.post(`${this.host}/api/embeddings`, {
        model: this.embedModel,
        prompt: text,
        keep_alive: "2m"
      }, { timeout: 60000 });
      const duration = Date.now() - start;
      logger.info({ duration: `${duration}ms` }, `✅ AI Embedding finished`);
      return response.data.embedding;
    } catch (err: any) {
      logger.error({ error: err.message }, `❌ AI Embedding failed`);
      throw err;
    }
  }

  async embedText(text: string): Promise<number[]> {
    return this.generateEmbedding(text);
  }

  private async tryGenerate(model: string, prompt: string): Promise<string> {
    const start = Date.now();
    logger.info({ model }, `🧠 AI Generation started [${model}]`);
    if (this.hostAvailable !== false) {
      try {
        const res = await axios.post(`${this.host}/api/generate`, { 
          model, 
          prompt, 
          stream: false,
          keep_alive: "2m" 
        }, { timeout: 120000 });
        this.hostAvailable = true;
        const duration = Date.now() - start;
        logger.info({ model, duration: `${duration}ms`, prompt, response: res.data.response }, `✅ AI Generation finished [${model}]`);
        return res.data.response;
      } catch (err: any) {
        logger.error({ model, error: err.message }, `❌ AI Generation failed [${model}]`);
        this.hostAvailable = false;
      }
    }
    return this.runViaCli(model, prompt);
  }

  private async tryGenerateWithImage(model: string, prompt: string, imageBuffers: Buffer[]): Promise<string> {
    const start = Date.now();
    logger.info({ model, imageCount: imageBuffers.length }, `👁️ AI Vision analysis started [${model}]`);
    if (this.hostAvailable !== false) {
      try {
        const res = await axios.post(`${this.host}/api/generate`, {
          model,
          prompt,
          images: imageBuffers.map(b => b.toString('base64')),
          stream: false,
          keep_alive: "2m"
        }, { timeout: 180000 });
        this.hostAvailable = true;
        const duration = Date.now() - start;
        logger.info({ model, duration: `${duration}ms`, prompt, response: res.data.response }, `✅ AI Vision analysis finished [${model}]`);
        return res.data.response;
      } catch (err: any) {
        logger.error({ model, error: err.message }, `❌ AI Vision analysis failed [${model}]`);
        this.hostAvailable = false;
        throw err;
      }
    }
    return this.runViaCli(model, prompt);
  }

  private runViaCli(model: string, prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const tmpFile = join(tmpdir(), `ollama_prompt_${Date.now()}.txt`);
      try {
        writeFileSync(tmpFile, prompt);
        const cmd = `ollama run ${model} < "${tmpFile}"`;

        exec(cmd, { timeout: 180000, maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
          try { unlinkSync(tmpFile); } catch {}
          if (error) return reject(new Error(`Ollama CLI failed: ${error.message}`));
          const cleanOutput = stdout.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim();
          resolve(cleanOutput);
        });
      } catch (err: any) {
        try { unlinkSync(tmpFile); } catch {}
        reject(err);
      }
    });
  }
}
