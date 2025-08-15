import OpenAI from 'openai';
import { MemoryVector } from '../types/memory';

export class EmbeddingsService {
  private static instance: EmbeddingsService;
  private openai: OpenAI;

  private constructor() {
    console.log('[EmbeddingsService] Constructor called.');
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.error('[EmbeddingsService] OPENAI_API_KEY is not set.');
        throw new Error('OPENAI_API_KEY is not set.');
      }
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('[EmbeddingsService] OpenAI client initialized successfully.');
    } catch (error) {
      console.error('[EmbeddingsService] Error during OpenAI client initialization:', error);
      throw error; // Re-throw the error to be caught by the calling service
    }
  }

  static getInstance(): EmbeddingsService {
    if (!EmbeddingsService.instance) {
      EmbeddingsService.instance = new EmbeddingsService();
    }
    return EmbeddingsService.instance;
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to create embedding:', error);
      throw error;
    }
  }

  async createBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: texts,
      });
      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Failed to create batch embeddings:', error);
      throw error;
    }
  }
}
