import { v4 as uuidv4 } from 'uuid';
import { RoleSpecificAgent, AgentRole, TaskInfo, TaskResult } from '@/types/agents';
import { AgentType, getModelForAgent, getFallbackModel } from '@/lib/config/modelConfig';
import { EmailService } from '@/services/emailService';
import { WebSocketService } from '@/utils/websocket';
import { RunCodeTool } from '../tools/RunCodeTool';
import { CodeExecutionParams, CodeExecutionResult } from '../types/tools';

export class AgentService {
  private static instance: AgentService;
  private agents: Map<string, RoleSpecificAgent>;
  private emailService: EmailService;
  private wsService: WebSocketService;
  private runCodeTool: RunCodeTool;

  private constructor() {
    this.agents = new Map();
    this.emailService = new EmailService();
    this.wsService = new WebSocketService();
    this.runCodeTool = new RunCodeTool();
  }

  static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  async createAgent(role: AgentRole): Promise<RoleSpecificAgent> {
    const agentType = this.determineAgentType(role);
    const primaryModel = getModelForAgent(agentType);
    const fallbackModel = getFallbackModel(agentType);

    const agent: RoleSpecificAgent = {
      id: uuidv4(),
      role,
      model: primaryModel,
      fallbackModel,
      state: {
        id: uuidv4(),
        status: 'idle',
        performance: {
          tasksCompleted: 0,
          successRate: 100,
          averageResponseTime: 0,
          lastActive: new Date(),
          codeExecution: {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageExecutionTime: 0
          }
        }
      },
      // Add toolkit for tech team agents
      toolkit: role.team === 'tech' ? {
        runCode: async (params: CodeExecutionParams): Promise<CodeExecutionResult> => {
          const startTime = Date.now();
          try {
            const result = await this.runCodeTool.run(params);
            
            // Update metrics
            const executionTime = Date.now() - startTime;
            this.updateCodeExecutionMetrics(agent, result.success, executionTime);
            
            return result;
          } catch (error) {
            this.updateCodeExecutionMetrics(agent, false, Date.now() - startTime);
            throw error;
          }
        }
      } : undefined,
      async handleTask(task: TaskInfo): Promise<TaskResult> {
        this.state.status = 'working';
        this.state.currentTask = task;
        
        try {
          // Task execution logic here
          const result = await this.executeTask(task);
          
          // Update metrics
          this.state.performance.tasksCompleted++;
          this.state.status = 'idle';
          
          // Send email notification for important updates
          await AgentService.getInstance().notifyProgress(this, task, result);
          
          return result;
        } catch (error) {
          this.state.status = 'error';
          throw error;
        }
      },
      collaborate(agents: RoleSpecificAgent[]): void {
        // Collaboration logic between agents
      },
      collaborationConfig: {
        canInitiateChat: true,
        notificationPreferences: {
          email: true,
        },
      },
    };

    this.agents.set(agent.id, agent);
    this.wsService.broadcastAgentUpdate(agent);
    return agent;
  }

  private determineAgentType(role: AgentRole): AgentType {
    if (role.team === 'tech') return AgentType.CODING;
    if (role.team === 'business') return AgentType.ADVISORY;
    return AgentType.GENERAL;
  }

  private updateCodeExecutionMetrics(
    agent: RoleSpecificAgent,
    success: boolean,
    executionTime: number
  ): void {
    const metrics = agent.state.performance.codeExecution;
    if (metrics) {
      metrics.totalExecutions++;
      if (success) {
        metrics.successfulExecutions++;
      } else {
        metrics.failedExecutions++;
      }
      metrics.averageExecutionTime = (
        (metrics.averageExecutionTime * (metrics.totalExecutions - 1) + executionTime) /
        metrics.totalExecutions
      );
      metrics.lastExecutionTimestamp = new Date();
    }
  }

  async notifyProgress(agent: RoleSpecificAgent, task: TaskInfo, result: TaskResult): Promise<void> {
    if (task.progress % 25 === 0 || result.success) { // Notify on 25% intervals or completion
      await this.emailService.sendUpdate({
        subject: `Task Update: ${task.title}`,
        content: this.formatProgressUpdate(agent, task, result),
        priority: task.priority
      });
    }
  }

  private formatProgressUpdate(agent: RoleSpecificAgent, task: TaskInfo, result: TaskResult): string {
    return `
      Agent: ${agent.role.name}
      Task: ${task.title}
      Progress: ${task.progress}%
      Status: ${result.success ? 'Completed' : 'In Progress'}
      Metrics: ${JSON.stringify(result.metrics, null, 2)}
    `;
  }

  getAgent(id: string): RoleSpecificAgent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): RoleSpecificAgent[] {
    return Array.from(this.agents.values());
  }
}
