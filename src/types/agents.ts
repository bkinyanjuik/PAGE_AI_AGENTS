import { ModelConfig, AgentType } from '../lib/config/modelConfig';

export interface BaseAgent {
  name: string;
  primaryModel: ModelConfig;
  fallbackModels: ModelConfig[];
  currentModel: ModelConfig;
  kwargs: Record<string, any>;
}

export interface RoleSpecificAgent extends BaseAgent {
  fallbackToNextModel(): Promise<boolean>;
}

// Role-specific agent types
export interface BackendEngineer extends RoleSpecificAgent {}
export interface FrontendDeveloper extends RoleSpecificAgent {}
export interface DevOpsEngineer extends RoleSpecificAgent {}
export interface TechLead extends RoleSpecificAgent {}
export interface AgentArchitect extends RoleSpecificAgent {}
export interface QAEngineer extends RoleSpecificAgent {}

export interface Agent {
  id: string;
  type: AgentType;
  model: ModelConfig;
  fallbackModel?: ModelConfig | null;
  capabilities: string[];
  // ... other agent properties
}

export interface AgentState {
  id: string;
  status: 'idle' | 'working' | 'error';
  currentTask?: TaskInfo;
  performance: AgentMetrics;
}

export interface AgentMetrics {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number;
  lastActive: Date;
}

export interface TaskInfo {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignedTo: string;
  progress: number;
  deadline?: Date;
  dependencies?: string[];
}

export enum TeamType {
  TECH = 'tech',
  BUSINESS = 'business',
  RESEARCH = 'research'
}

export interface AgentRole {
  name: string;
  team: TeamType;
  specialization: string[];
  requiredCapabilities: string[];
  githubAccess?: {
    repositories: string[];
    permissions: ('read' | 'write' | 'admin')[];
  };
  crewPosition?: {
    role: string;
    subordinates?: string[];
    supervisor?: string;
  };
}

export interface CollaborationConfig {
  canInitiateChat: boolean;
  requiredApprovals?: number;
  reviewers?: string[];
  notificationPreferences: {
    email: boolean;
    slack?: boolean;
    github?: boolean;
  };
}

// Extending existing interfaces
export interface RoleSpecificAgent {
  id: string;
  role: AgentRole;
  model: ModelConfig;
  fallbackModel?: ModelConfig;
  state: AgentState;
  collaborationConfig: CollaborationConfig;
  handleTask(task: TaskInfo): Promise<TaskResult>;
  collaborate(agents: RoleSpecificAgent[]): void;
  commitToGithub?(path: string, content: string, message: string): Promise<void>;
  reviewCode?(pullRequest: number): Promise<TaskResult>;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  output: any;
  error?: string;
  metrics: {
    timeSpent: number;
    resourcesUsed: string[];
    completionRate: number;
  };
}

// Add new interfaces for agent control
export interface AgentProfile {
  id: string;
  name: string;
  role: AgentRole;
  model: {
    name: string;
    provider: string;
    capabilities: string[];
  };
  metrics: AgentMetrics;
  status: AgentStatus;
  logs: AgentLog[];
}

export interface AgentStatus {
  state: 'idle' | 'working' | 'error' | 'paused';
  currentTask?: TaskInfo;
  lastActive: Date;
  healthCheck: {
    status: 'healthy' | 'degraded' | 'error';
    message?: string;
  };
}

export interface AgentLog {
  id: string;
  timestamp: Date;
  type: 'action' | 'decision' | 'error' | 'commit' | 'review';
  content: string;
  metadata: {
    taskId?: string;
    tool?: string;
    repository?: string;
    duration?: number;
  };
}

export interface AgentControlCommand {
  type: 'start' | 'stop' | 'pause' | 'resume' | 'trigger';
  agentId: string;
  taskInput?: any;
  priority?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}
