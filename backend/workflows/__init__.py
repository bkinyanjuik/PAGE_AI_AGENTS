from langgraph.graph import StateGraph
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
from crewai import Task, Crew, Process
from typing import List, Dict
from ..agents import ExecutiveDivision, TechnicalDivision, BusinessDivision, ComplianceDivision

class WorkflowManager:
    def __init__(self):
        self.graph = StateGraph()
        
    def create_sequential_workflow(self, agents, tasks):
        """Create a sequential workflow using LangGraph"""
        for i, agent in enumerate(agents):
            self.graph.add_node(agent.role, agent)
            if i > 0:
                self.graph.add_edge(agents[i-1].role, agent.role)
        self.graph.set_entry_point(agents[0].role)
        return self.graph.compile()
        
    def create_group_chat(self, agents, max_rounds=10):
        """Create a group chat using AutoGen"""
        user_proxy = UserProxyAgent(
            name="Human",
            code_execution_config={"work_dir": "workspace"}
        )
        
        chat = GroupChat(
            agents=[user_proxy] + agents,
            messages=[],
            max_round=max_rounds
        )
        
        return GroupChatManager(
            groupchat=chat,
            llm_config={"model": "gpt-4"}
        )

class FinTechWorkflows:
    def __init__(self, memory_chain):
        self.memory_chain = memory_chain
        self.executive = ExecutiveDivision()
        self.technical = TechnicalDivision()
        self.business = BusinessDivision()
        self.compliance = ComplianceDivision()

    def credit_scoring_development(self):
        """Complete workflow for credit scoring system development"""
        # Initialize key agents
        cto = self.executive.create_cto_agent(self.memory_chain)
        lead_ai = self.technical.create_lead_ai_engineer(self.memory_chain)
        risk_analyst = self.business.create_risk_analyst(self.memory_chain)
        compliance = self.compliance.create_compliance_officer(self.memory_chain)

        tasks = [
            Task(
                description="Design credit scoring system architecture",
                agent=cto
            ),
            Task(
                description="Develop ML models for credit assessment",
                agent=lead_ai
            ),
            Task(
                description="Validate model accuracy and risk metrics",
                agent=risk_analyst
            ),
            Task(
                description="Ensure regulatory compliance of models",
                agent=compliance
            )
        ]

        return Crew(
            agents=[cto, lead_ai, risk_analyst, compliance],
            tasks=tasks,
            process=Process.sequential,
            verbose=True
        )

    def product_development(self):
        """Workflow for new feature development"""
        product_manager = self.business.create_product_manager(self.memory_chain)
        backend_dev = self.technical.create_backend_developer(self.memory_chain)
        devops = self.technical.create_devops_engineer(self.memory_chain)

        tasks = [
            Task(
                description="Define feature specifications and requirements",
                agent=product_manager
            ),
            Task(
                description="Implement backend services and APIs",
                agent=backend_dev
            ),
            Task(
                description="Deploy and monitor new features",
                agent=devops
            )
        ]

        return Crew(
            agents=[product_manager, backend_dev, devops],
            tasks=tasks,
            process=Process.sequential,
            verbose=True
        )

    def risk_assessment(self):
        """Workflow for risk assessment and compliance"""
        cro = self.executive.create_cro_agent(self.memory_chain)
        risk_analyst = self.business.create_risk_analyst(self.memory_chain)
        compliance = self.compliance.create_compliance_officer(self.memory_chain)

        tasks = [
            Task(
                description="Assess overall system risk profile",
                agent=cro
            ),
            Task(
                description="Analyze credit risk metrics and patterns",
                agent=risk_analyst
            ),
            Task(
                description="Verify compliance with regulations",
                agent=compliance
            )
        ]

        return Crew(
            agents=[cro, risk_analyst, compliance],
            tasks=tasks,
            process=Process.sequential,
            verbose=True
        )
