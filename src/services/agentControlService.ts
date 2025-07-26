import { v4 as uuidv4 } from 'uuid';
import { 
  AgentProfile, 
  AgentControlCommand, 
  AgentLog,
  TaskInfo 
} from '../types/agents';
import { MemoryService } from './memoryService';
import { NotificationService } from './notificationService';
import { MessageBusService } from './messageBusService';

export class AgentControlService {
  private static instance: AgentControlService;
  private memoryService: MemoryService;
  private notificationService: NotificationService;
  private messageBus: MessageBusService;
  private activeAgents: Map<string, AgentProfile>;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.messageBus = MessageBusService.getInstance();
    this.activeAgents = new Map();
  }

  static getInstance(): AgentControlService {
    if (!AgentControlService.instance) {
      AgentControlService.instance = new AgentControlService();
    }
    return AgentControlService.instance;
  }

  async getAgentProfile(agentId: string): Promise<AgentProfile | null> {
    const agent = this.activeAgents.get(agentId);
    if (!agent) return null;

    // Get latest metrics and logs
    const metrics = await this.memoryService.getAgentPerformance(agentId);
    const recentLogs = await this.getAgentLogs(agentId);

    return {
      ...agent,
      metrics,
      logs: recentLogs
    };
  }

  async triggerAgent(command: AgentControlCommand): Promise<void> {
    const agent = this.activeAgents.get(command.agentId);
    if (!agent) throw new Error('Agent not found');

    // Create task from command
    const task: TaskInfo = {
      id: uuidv4(),
      type: 'manual_trigger',
      input: command.taskInput,
      priority: command.priority || 'medium',
      timestamp: Date.now()
    };

    // Log the trigger action
    await this.logAgentAction(command.agentId, {
      type: 'action',
      content: `Agent manually triggered: ${task.type}`,
      metadata: {
        taskId: task.id,
        command: command.type
      }
    });

    // Notify agent through message bus
    await this.messageBus.sendMessage(
      'control_service',
      command.agentId,
      'EXECUTE_TASK',
      task,
      task.priority
    );

    // Update agent status
    agent.status.state = 'working';
    agent.status.currentTask = task;
    this.activeAgents.set(command.agentId, agent);

    // Broadcast status update
    await this.notificationService.notify(
      {
        title: 'Agent Triggered',
        content: `Agent ${agent.name} started task ${task.id}`,
        priority: 'medium',
        metadata: { agent: agent.id, task: task.id }
      },
      { websocket: true }
    );
  }

  async logAgentAction(
    agentId: string,
    log: Partial<AgentLog>
  ): Promise<void> {
    const fullLog: AgentLog = {
      id: uuidv4(),
      timestamp: new Date(),
      type: log.type || 'action',
      content: log.content || '',
      metadata: log.metadata || {}
    };

    // Store log in memory
    await this.memoryService.storeMemory(
      JSON.stringify(fullLog),
      'log',
      {
        agentId,
        timestamp: fullLog.timestamp.getTime(),
        tags: ['agent_log', fullLog.type]
      }
    );

    // Update agent's logs
    const agent = this.activeAgents.get(agentId);
    if (agent) {
      agent.logs = [fullLog, ...agent.logs].slice(0, 100); // Keep last 100 logs
      this.activeAgents.set(agentId, agent);
    }
  }

  async getAgentLogs(
    agentId: string,
    filter?: {
      type?: AgentLog['type'][];
      timeRange?: { start: number; end: number };
      limit?: number;
    }
  ): Promise<AgentLog[]> {
    const searchResults = await this.memoryService.searchMemory(
      '',
      {
        filter: {
          type: ['log'],
          agentId,
          tags: filter?.type ? ['agent_log', ...filter.type] : ['agent_log'],
          timeRange: filter?.timeRange
        },
        limit: filter?.limit || 100
      }
    );

    return searchResults
      .map(result => JSON.parse(result.metadata.content) as AgentLog)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async updateAgentStatus(
    agentId: string,
    status: Partial<AgentProfile['status']>
  ): Promise<void> {
    const agent = this.activeAgents.get(agentId);
    if (!agent) return;

    agent.status = { ...agent.status, ...status };
    this.activeAgents.set(agentId, agent);

    // Broadcast status update
    await this.notificationService.notify(
      {
        title: 'Agent Status Update',
        content: `Agent ${agent.name} status: ${status.state}`,
        priority: 'low',
        metadata: { agent: agent.id, status }
      },
      { websocket: true }
    );
  }
}
