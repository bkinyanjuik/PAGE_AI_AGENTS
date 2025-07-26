from typing import Optional
from ..config.roles import TeamRole, get_primary_model_for_role, get_models_for_role
from ..config.model_config import ModelConfig
from .roles import (
    BackendEngineer, FrontendDeveloper, DevOpsEngineer,
    TechLead, AgentArchitect, QAEngineer
)

class AgentFactory:
    _role_map = {
        TeamRole.BACKEND: BackendEngineer,
        TeamRole.FRONTEND: FrontendDeveloper,
        TeamRole.DEVOPS: DevOpsEngineer,
        TeamRole.TECH_LEAD: TechLead,
        TeamRole.AGENT_ARCHITECT: AgentArchitect,
        TeamRole.QA: QAEngineer
    }

    @classmethod
    def create_agent(cls, role: TeamRole, name: str, **kwargs):
        """Create an agent for a specific team role with appropriate model configuration."""
        if role not in cls._role_map:
            raise ValueError(f"Unknown role: {role}")
        
        agent_class = cls._role_map[role]
        models = get_models_for_role(role)
        
        # For coding-related roles, ensure KIMI2 is the primary model if available
        if role in [TeamRole.BACKEND, TeamRole.FRONTEND] and "kimi2" in [m.name for m in models]:
            kimi2_model = next(m for m in models if m.name == "kimi2")
            other_models = [m for m in models if m.name != "kimi2"]
            models = [kimi2_model] + other_models
        
        return agent_class(
            name=name,
            primary_model=models[0],
            fallback_models=models[1:],
            **kwargs
        )

    @classmethod
    def is_coding_role(cls, role: TeamRole) -> bool:
        """Helper method to determine if a role is coding-focused."""
        return role in [TeamRole.BACKEND, TeamRole.FRONTEND, TeamRole.AGENT_ARCHITECT]
