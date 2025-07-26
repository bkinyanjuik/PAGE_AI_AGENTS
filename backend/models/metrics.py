from pydantic import BaseModel
from typing import List, Dict, Optional, Union, Any
from datetime import datetime
from enum import Enum
import json
from ..config.roles import TeamRole
from ..config.model_config import ModelConfig

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class TaskMetrics(BaseModel):
    task_id: str
    title: str
    description: str
    assigned_to: str
    priority: TaskPriority
    status: TaskStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    advisory_notes: List[str] = []
    dependencies: List[str] = []

class AdvisoryMetrics(BaseModel):
    advisory_id: str
    task_id: str
    suggestion: str
    confidence: float
    created_at: datetime
    implemented: bool = False

class AgentMetrics(BaseModel):
    agent_id: str
    role: str
    division: str
    status: str
    tasks_completed: int
    success_rate: float
    current_task: Optional[str] = None
    last_active: datetime
    specialties: List[str] = []
    workload: int = 0
    
class WorkflowMetrics(BaseModel):
    workflow_id: str
    name: str
    description: str
    status: str
    tasks: List[Dict]
    started_at: datetime
    completed_at: Optional[datetime] = None
    
class MetricsStore:
    def __init__(self):
        self.agents: Dict[str, AgentMetrics] = {}
        self.workflows: Dict[str, WorkflowMetrics] = {}
        self.tasks: Dict[str, TaskMetrics] = {}
        self.advisories: Dict[str, List[AdvisoryMetrics]] = {}
    
    # Agent Methods
    def update_agent(self, metrics: AgentMetrics):
        self.agents[metrics.agent_id] = metrics
        
    def get_all_agents(self) -> List[AgentMetrics]:
        return list(self.agents.values())
    
    def get_available_agents(self) -> List[AgentMetrics]:
        return [agent for agent in self.agents.values() if agent.workload < 3]
    
    # Workflow Methods
    def update_workflow(self, metrics: WorkflowMetrics):
        self.workflows[metrics.workflow_id] = metrics
        
    def get_all_workflows(self) -> List[WorkflowMetrics]:
        return list(self.workflows.values())
    
    # Task Methods
    def create_task(self, task: TaskMetrics):
        self.tasks[task.task_id] = task
        
    def update_task(self, task_id: str, updates: Dict):
        if task_id in self.tasks:
            current_task = self.tasks[task_id]
            for key, value in updates.items():
                setattr(current_task, key, value)
    
    def get_task(self, task_id: str) -> Optional[TaskMetrics]:
        return self.tasks.get(task_id)
    
    def get_all_tasks(self) -> List[TaskMetrics]:
        return list(self.tasks.values())
    
    def get_agent_tasks(self, agent_id: str) -> List[TaskMetrics]:
        return [task for task in self.tasks.values() if task.assigned_to == agent_id]

class ModelMetrics:
    def __init__(self):
        self.usage_stats: Dict[str, Dict] = {}
        self.performance_metrics: Dict[str, Dict] = {}
        self.role_stats: Dict[TeamRole, Dict] = {}

    def log_model_usage(self, model: ModelConfig, role: TeamRole, 
                       tokens_used: int, duration_ms: int):
        """Log usage statistics for a model."""
        timestamp = datetime.now().isoformat()
        
        if model.name not in self.usage_stats:
            self.usage_stats[model.name] = {
                "total_tokens": 0,
                "total_requests": 0,
                "avg_duration_ms": 0,
                "history": []
            }
            
        stats = self.usage_stats[model.name]
        stats["total_tokens"] += tokens_used
        stats["total_requests"] += 1
        stats["avg_duration_ms"] = (
            (stats["avg_duration_ms"] * (stats["total_requests"] - 1) + duration_ms) 
            / stats["total_requests"]
        )
        
        # Log role-specific metrics
        if role not in self.role_stats:
            self.role_stats[role] = {}
        if model.name not in self.role_stats[role]:
            self.role_stats[role][model.name] = 0
        self.role_stats[role][model.name] += 1

    def log_model_performance(self, model: ModelConfig, role: TeamRole, 
                            success: bool, error: Optional[str] = None):
        """Log performance metrics for a model."""
        if model.name not in self.performance_metrics:
            self.performance_metrics[model.name] = {
                "success_count": 0,
                "error_count": 0,
                "errors": []
            }
            
        metrics = self.performance_metrics[model.name]
        if success:
            metrics["success_count"] += 1
        else:
            metrics["error_count"] += 1
            if error:
                metrics["errors"].append({
                    "timestamp": datetime.now().isoformat(),
                    "error": error,
                    "role": role.value
                })

metrics_tracker = ModelMetrics()
