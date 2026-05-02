import { PDFParse } from 'pdf-parse';

export class PdfService {
  async extractText(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    try {
      const data = await parser.getText();
      return data.text.replace(/\x00/g, '');
    } catch (error) {
      throw new Error('Failed to extract text from PDF');
    } finally {
      await parser.destroy();
    }
  }

  chunkText(text: string, chunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += sentence + '. ';
    }
    
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks.filter(c => c.trim().length > 5);
  }
}
