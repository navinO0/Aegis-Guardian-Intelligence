import sharp from 'sharp';
import { logger } from '../utils/logger.js';

export class ImageService {
  /**
   * Optimizes an image for AI vision models.
   * Resizes to max 1024px and converts to high-quality PNG.
   */
  async optimizeForAi(buffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        return buffer;
      }

      // Max dimension 1024px to keep it light for Ollama
      if (metadata.width > 1024 || metadata.height > 1024) {
        logger.info(`🖼️  Optimizing large image (${metadata.width}x${metadata.height}) for AI...`);
        return await image
          .resize(1024, 1024, { fit: 'inside' })
          .png({ quality: 80 })
          .toBuffer();
      }

      return buffer;
    } catch (error) {
      logger.error(`❌ Image optimization failed: ${error}`);
      return buffer; // Fallback to original
    }
  }
}
