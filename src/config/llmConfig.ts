import { config } from 'dotenv';
config();

export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'custom';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}

export interface LLMModelConfig {
  primary: LLMConfig;
  fallback?: LLMConfig;
}

// Load configs from environment variables
export const llmConfigs: Record<LLMProvider, LLMConfig> = {
  openai: {
    provider: 'openai',
    model: process.env.OPENAI_MODEL || 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY || '',
    temperature: 0.7,
    maxTokens: 2048
  },
  anthropic: {
    provider: 'anthropic',
    model: process.env.ANTHROPIC_MODEL || 'claude-2',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    temperature: 0.7
  },
  google: {
    provider: 'google',
    model: process.env.GOOGLE_MODEL || 'gemini-pro',
    apiKey: process.env.GOOGLE_API_KEY || '',
    temperature: 0.7
  },
  custom: {
    provider: 'custom',
    model: process.env.CUSTOM_MODEL || 'local',
    apiKey: process.env.CUSTOM_API_KEY || '',
    baseURL: process.env.CUSTOM_API_URL
  }
};
