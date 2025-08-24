import { LLMConfig, LLMProvider } from '../../config/llmConfig';
import { OpenAIApi, Configuration } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface LLMRequest {
  messages: Array<{role: string, content: string}>;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMService {
  private config: LLMConfig;
  private client: any;

  constructor(config: LLMConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient() {
    switch(this.config.provider) {
      case 'openai':
        const configuration = new Configuration({
          apiKey: this.config.apiKey,
        });
        this.client = new OpenAIApi(configuration);
        break;
      
      case 'anthropic':
        this.client = new Anthropic({
          apiKey: this.config.apiKey,
        });
        break;
      
      // Add other providers as needed
    }
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    try {
      switch(this.config.provider) {
        case 'openai':
          const openAIResponse = await this.client.createChatCompletion({
            model: this.config.model,
            messages: request.messages,
            temperature: request.temperature || this.config.temperature,
            max_tokens: request.maxTokens || this.config.maxTokens
          });

          return {
            content: openAIResponse.data.choices[0].message?.content || '',
            usage: {
              promptTokens: openAIResponse.data.usage.prompt_tokens,
              completionTokens: openAIResponse.data.usage.completion_tokens,
              totalTokens: openAIResponse.data.usage.total_tokens
            }
          };

        case 'anthropic':
          const anthropicResponse = await this.client.messages.create({
            model: this.config.model,
            messages: request.messages,
            temperature: request.temperature || this.config.temperature,
            max_tokens: request.maxTokens || this.config.maxTokens
          });

          return {
            content: anthropicResponse.content[0].text,
            usage: {
              promptTokens: 0, // Anthropic doesn't provide token counts
              completionTokens: 0,
              totalTokens: 0
            }
          };

        default:
          throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('LLM API Error:', error);
      throw error;
    }
  }
}
