from enum import Enum
from typing import List, Dict
from .model_config import ModelConfig, ModelProvider

class TeamRole(Enum):
    BACKEND = "backend"
    FRONTEND = "frontend"
    DEVOPS = "devops"
    TECH_LEAD = "tech_lead"
    AGENT_ARCHITECT = "agent_architect"
    QA = "qa"

class RoleConfig:
    def __init__(self, models: List[str], context_length: int, description: str):
        self.models = models
        self.context_length = context_length
        self.description = description

ROLE_CONFIGS = {
    TeamRole.BACKEND: RoleConfig(
        models=["kimi2", "deepseek-coder", "mixtral-8x7b"],  # KIMI2 as primary
        context_length=32768,  # Increased for KIMI2
        description="Code-heavy tasks, fast iteration, using KIMI2 for enhanced coding capabilities"
    ),
    TeamRole.FRONTEND: RoleConfig(
        models=["kimi2", "mistral-7b", "claude-haiku"],  # KIMI2 as primary
        context_length=32768,
        description="UI logic, state management help, using KIMI2 for frontend code generation"
    ),
    TeamRole.DEVOPS: RoleConfig(
        models=["deepseek-r1", "mistral-small", "llama-3"],
        context_length=4096,
        description="YAML, shell, config generation"
    ),
    TeamRole.TECH_LEAD: RoleConfig(
        models=["mixtral-8x7b", "deepseek", "moonshot-v1"],
        context_length=16384,
        description="Strategic planning, spec writing, long context"
    ),
    TeamRole.AGENT_ARCHITECT: RoleConfig(
        models=["kimi2", "command-r+", "moonshot"],  # Added KIMI2 as option
        context_length=32768,
        description="Designing RAG agents, orchestrating LLM chains, code architecture"
    ),
    TeamRole.QA: RoleConfig(
        models=["claude-haiku", "command-r+", "mistral-small"],
        context_length=4096,
        description="Fast text understanding and logic checking"
    )
}

def get_models_for_role(role: TeamRole) -> List[ModelConfig]:
    """Get the ordered list of model configurations for a given team role."""
    from .model_config import MODEL_CONFIGS
    return [MODEL_CONFIGS[model] for model in ROLE_CONFIGS[role].models]

def get_primary_model_for_role(role: TeamRole) -> ModelConfig:
    """Get the primary model configuration for a given team role."""
    return get_models_for_role(role)[0]
