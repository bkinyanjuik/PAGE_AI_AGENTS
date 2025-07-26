import { MemoryConfig } from '../types/memory';

export const MEMORY_CONFIG: MemoryConfig = {
  vectorDbUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  collectionName: 'agent_memories',
  dimension: 1536, // OpenAI ada-002 embedding dimension
  shortTermTTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  similarityThreshold: 0.75
};

export const MEMORY_COLLECTIONS = {
  TASKS: 'tasks',
  CONVERSATIONS: 'conversations',
  DOCUMENTS: 'documents',
  CODE: 'code'
} as const;
