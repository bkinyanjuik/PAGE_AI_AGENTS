from crewai import Agent
from langchain.chat_models import ChatOpenAI
from ..tools.github_tool import GitHubTool
import os
from ..config.model_config import AgentType, ModelConfig, get_model_for_agent
from typing import Optional

def get_agent_llm(agent_type):
    """Get the appropriate LLM based on agent type"""
    base_config = {
        "base_url": "https://openrouter.ai/api/v1",
        "api_key": os.getenv("OPENROUTER_API_KEY"),
    }
    
    model_mapping = {
        "technical": os.getenv("CODING_MODEL", "kimi-ai/kimi-k2"),
        "business": os.getenv("BUSINESS_MODEL", "anthropic/claude-3-sonnet"),
        "default": os.getenv("DEFAULT_MODEL", "kimi-ai/kimi-k2")
    }
    
    model = model_mapping.get(agent_type.lower(), model_mapping["default"])
    return ChatOpenAI(model=model, **base_config)

class ExecutiveDivision:
    @staticmethod
    def create_ceo_agent(memory_chain):
        return Agent(
            role='CEO Agent',
            goal='Set company vision, strategy and growth targets',
            backstory='Visionary fintech leader focused on innovation in credit scoring',
            llm=get_agent_llm("business"),
            memory=memory_chain,
            verbose=True
        )

    @staticmethod 
    def create_cto_agent(memory_chain):
        return Agent(
            role='CTO Agent',
            goal='Drive technical innovation and architecture decisions',
            backstory='Technical visionary specializing in AI and ML systems',
            llm=get_agent_llm("technical"),
            tools=[GitHubTool()],
            memory=memory_chain,
            verbose=True
        )

    @staticmethod
    def create_cro_agent(memory_chain):
        return Agent(
            role='Chief Risk Officer Agent',
            goal='Oversee risk management and compliance strategies',
            backstory='Expert in financial risk assessment and regulatory compliance',
            llm=get_agent_llm("business"),
            memory=memory_chain,
            verbose=True
        )

class TechnicalDivision:
    @staticmethod
    def create_lead_ai_engineer(memory_chain):
        return Agent(
            role='Lead AI Engineer',
            goal='Develop and optimize ML models for credit scoring',
            backstory='ML expert specialized in financial modeling',
            llm=get_agent_llm("technical"),
            tools=[GitHubTool()],
            memory=memory_chain,
            verbose=True
        )

    @staticmethod
    def create_backend_developer(memory_chain):
        return Agent(
            role='Backend Developer',
            goal='Build robust APIs and system architecture',
            backstory='Expert in scalable financial systems',
            llm=get_agent_llm("technical"),
            tools=[GitHubTool()],
            memory=memory_chain,
            verbose=True
        )

    @staticmethod
    def create_devops_engineer(memory_chain):
        return Agent(
            role='DevOps Engineer',
            goal='Manage infrastructure and deployment pipelines',
            backstory='Infrastructure and automation specialist',
            llm=get_agent_llm("technical"),
            tools=[GitHubTool()],
            memory=memory_chain,
            verbose=True
        )

class BusinessDivision:
    @staticmethod
    def create_product_manager(memory_chain):
        return Agent(
            role='Product Manager',
            goal='Define product strategy and roadmap',
            backstory='Product strategist focused on fintech solutions',
            llm=get_agent_llm("business"),
            memory=memory_chain,
            verbose=True
        )

    @staticmethod
    def create_risk_analyst(memory_chain):
        return Agent(
            role='Credit Risk Analyst',
            goal='Analyze and optimize credit risk models',
            backstory='Expert in credit risk assessment',
            llm=get_agent_llm("business"),
            memory=memory_chain,
            verbose=True
        )

class ComplianceDivision:
    @staticmethod
    def create_compliance_officer(memory_chain):
        return Agent(
            role='Compliance Officer',
            goal='Ensure regulatory compliance and risk management',
            backstory='Regulatory expert in financial services',
            llm=get_agent_llm("business"),
            memory=memory_chain,
            verbose=True
        )

class BaseAgent:
    def __init__(self, agent_type: AgentType, name: str):
        self.agent_type = agent_type
        self.name = name
        self.model_config = get_model_for_agent(agent_type)
        
    async def initialize(self):
        """Initialize the agent with its designated model."""
        # Model initialization logic here
        pass

class CodingAgent(BaseAgent):
    def __init__(self, name: str):
        super().__init__(AgentType.CODING, name)

class GeneralAgent(BaseAgent):
    def __init__(self, name: str):
        super().__init__(AgentType.GENERAL, name)

class RAGAgent(BaseAgent):
    def __init__(self, name: str):
        super().__init__(AgentType.RAG, name)

class AdvisoryAgent(BaseAgent):
    def __init__(self, name: str):
        super().__init__(AgentType.ADVISORY, name)

class PerformanceAgent(BaseAgent):
    def __init__(self, name: str):
        super().__init__(AgentType.PERFORMANCE, name)
