import { v4 as uuidv4 } from 'uuid';
import { RoleSpecificAgent, AgentRole, TaskInfo, TaskResult } from '../types/agents';
import { AgentType, getModelForAgent, getFallbackModel } from '../lib/config/modelConfig';
import { EmailService } from './emailService';
import { WebSocketService } from '../utils/websocket';

export class AgentService {
  private static instance: AgentService;
  private agents: Map<string, RoleSpecificAgent>;
  private emailService: EmailService;
  private wsService: WebSocketService;

  private constructor() {
    console.log('[AgentService] Constructor called.');
    try {
      this.agents = new Map();
      this.emailService = new EmailService();
      console.log('[AgentService] EmailService instance obtained.');
      this.wsService = new WebSocketService();
      console.log('[AgentService] WebSocketService instance obtained.');
      console.log('[AgentService] Constructor finished successfully.');
    } catch (error) {
      console.error('[AgentService] Error during initialization:', error);
      throw error;
    }
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
          lastActive: new Date()
        }
      },
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
