from typing import List, Optional
from ...config.model_config import ModelConfig
from ..base import BaseAgent

class RoleSpecificAgent(BaseAgent):
    def __init__(self, name: str, primary_model: ModelConfig, 
                 fallback_models: List[ModelConfig] = None, **kwargs):
        self.name = name
        self.primary_model = primary_model
        self.fallback_models = fallback_models or []
        self.current_model = primary_model
        self.kwargs = kwargs

    async def fallback_to_next_model(self) -> bool:
        """Attempt to switch to the next available fallback model."""
        if not self.fallback_models:
            return False
            
        next_model = self.fallback_models.pop(0)
        self.current_model = next_model
        return True

class BackendEngineer(RoleSpecificAgent):
    """Specialized in backend development tasks."""
    pass

class FrontendDeveloper(RoleSpecificAgent):
    """Specialized in frontend development tasks."""
    pass

class DevOpsEngineer(RoleSpecificAgent):
    """Specialized in infrastructure and deployment tasks."""
    pass

class TechLead(RoleSpecificAgent):
    """Specialized in technical leadership and planning."""
    pass

class AgentArchitect(RoleSpecificAgent):
    """Specialized in designing and implementing AI agents."""
    pass

class QAEngineer(RoleSpecificAgent):
    """Specialized in testing and quality assurance."""
    pass
