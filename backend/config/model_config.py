from enum import Enum
from typing import Dict, Optional, List
import os

class AgentType(Enum):
    CODING = "coding"
    GENERAL = "general"
    RAG = "rag"
    ADVISORY = "advisory"
    PERFORMANCE = "performance"

class ModelProvider(Enum):
    OPENROUTER = "openrouter"
    OLLAMA = "ollama"
    KIMI = "kimi"
    CLAUDE = "claude"
    COHERE = "cohere"
    HUGGINGFACE = "huggingface"

class ModelConfig:
    def __init__(self, name: str, provider: ModelProvider, context_length: int,
                 is_free: bool, api_base: Optional[str] = None, capabilities: List[str] = None):
        self.name = name
        self.provider = provider
        self.context_length = context_length
        self.is_free = is_free
        self.api_base = api_base or os.getenv(f"{provider.value.upper()}_API_BASE")
        self.capabilities = capabilities or []

MODEL_CONFIGS = {
    "deepseek-coder": ModelConfig(
        "deepseek-coder", ModelProvider.OPENROUTER, 8192, True,
        capabilities=["code_generation", "code_review"]
    ),
    "mixtral-8x7b": ModelConfig(
        "mixtral-8x7b", ModelProvider.OPENROUTER, 32768, True,
        capabilities=["reasoning", "code_generation"]
    ),
    "llama-3-8b": ModelConfig(
        "llama-3-8b", ModelProvider.OLLAMA, 4096, True,
        capabilities=["code_generation"]
    ),
    "mistral-7b": ModelConfig(
        "mistral-7b", ModelProvider.OPENROUTER, 8192, True,
        capabilities=["general", "reasoning"]
    ),
    "mistral-small": ModelConfig(
        "mistral-small", ModelProvider.OPENROUTER, 4096, True,
        capabilities=["fast_inference"]
    ),
    "claude-haiku": ModelConfig(
        "claude-haiku", ModelProvider.CLAUDE, 4096, True,
        capabilities=["analysis", "safety"]
    ),
    "deepseek-r1": ModelConfig(
        "deepseek-r1", ModelProvider.OPENROUTER, 8192, True,
        capabilities=["code_generation", "reasoning"]
    ),
    "moonshot-v1": ModelConfig(
        "moonshot-v1", ModelProvider.KIMI, 32768, True,
        capabilities=["long_context", "reasoning"]
    ),
    "command-r+": ModelConfig(
        "command-r+", ModelProvider.COHERE, 4096, True,
        capabilities=["rag", "search"]
    ),
    "kimi2": ModelConfig(
        "kimi2", 
        ModelProvider.KIMI, 
        32768,  # Large context window
        True,
        capabilities=[
            "code_generation",
            "code_review",
            "debugging",
            "technical_writing"
        ]
    ),
}

AGENT_MODEL_MAPPING = {
    AgentType.CODING: ["deepseek-coder", "mixtral-8x7b"],
    AgentType.GENERAL: ["mistral-7b", "llama-3-8b"],
    AgentType.RAG: ["command-r+", "deepseek-r1"],
    AgentType.ADVISORY: ["claude-haiku", "mistral-small"],
    AgentType.PERFORMANCE: ["moonshot-v1", "mixtral-8x7b"]
}

def get_model_for_agent(agent_type: AgentType) -> ModelConfig:
    """Get the primary model configuration for a given agent type."""
    model_name = AGENT_MODEL_MAPPING[agent_type][0]
    return MODEL_CONFIGS[model_name]

def get_fallback_model(agent_type: AgentType) -> Optional[ModelConfig]:
    """Get the fallback model configuration for a given agent type."""
    models = AGENT_MODEL_MAPPING[agent_type]
    return MODEL_CONFIGS[models[1]] if len(models) > 1 else None
