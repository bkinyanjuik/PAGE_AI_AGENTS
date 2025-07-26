export enum AgentType {
  CODING = "coding",
  GENERAL = "general",
  RAG = "rag",
  ADVISORY = "advisory",
  PERFORMANCE = "performance"
}

export enum ModelProvider {
  OPENROUTER = "openrouter",
  OLLAMA = "ollama",
  KIMI = "kimi",
  CLAUDE = "claude",
  COHERE = "cohere",
  HUGGINGFACE = "huggingface"
}

export interface ModelConfig {
  name: string;
  provider: ModelProvider;
  contextLength: number;
  isFree: boolean;
  apiBase?: string;
  capabilities: string[];
  temperature?: number;
  maxTokens?: number;
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "deepseek-coder": {
    name: "deepseek-coder",
    provider: ModelProvider.OPENROUTER,
    contextLength: 8192,
    isFree: true,
    capabilities: ["code_generation", "code_review"],
    temperature: 0.7
  },
  "mixtral-8x7b": {
    name: "mixtral-8x7b",
    provider: ModelProvider.OPENROUTER,
    contextLength: 32768,
    isFree: true,
    capabilities: ["reasoning", "code_generation"],
    temperature: 0.7
  },
  "llama-3-8b": {
    name: "llama-3-8b",
    provider: ModelProvider.OLLAMA,
    contextLength: 4096,
    isFree: true,
    capabilities: ["code_generation"],
    temperature: 0.7
  },
  "kimi2": {
    name: "kimi2",
    provider: ModelProvider.KIMI,
    contextLength: 32768,
    isFree: true,
    capabilities: [
      "code_generation",
      "code_review",
      "debugging",
      "technical_writing"
    ],
    temperature: 0.7
  },
  // ... other models follow same pattern
} as const;

export const AGENT_MODEL_MAPPING: Record<AgentType, string[]> = {
  [AgentType.CODING]: ["kimi2", "deepseek-coder"],
  [AgentType.GENERAL]: ["mistral-7b", "llama-3-8b"],
  [AgentType.RAG]: ["command-r+", "deepseek-r1"],
  [AgentType.ADVISORY]: ["claude-haiku", "mistral-small"],
  [AgentType.PERFORMANCE]: ["moonshot-v1", "mixtral-8x7b"]
};

export const getModelForAgent = (agentType: AgentType): ModelConfig => {
  const modelName = AGENT_MODEL_MAPPING[agentType][0];
  return MODEL_CONFIGS[modelName];
};

export const getFallbackModel = (agentType: AgentType): ModelConfig | null => {
  const models = AGENT_MODEL_MAPPING[agentType];
  return models.length > 1 ? MODEL_CONFIGS[models[1]] : null;
};

// Remove the old default config since we now use specific models per agent type
