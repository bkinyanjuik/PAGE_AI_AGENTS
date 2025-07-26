import { TaskInfo, RoleSpecificAgent } from '../types/agents';
import { MessageBusService } from './messageBusService';
import { MemoryService } from './memoryService';
import { NotificationService } from './notificationService';

interface ConflictDetails {
  taskId: string;
  agents: string[];
  reason: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  taskRequirements?: string[];
}

interface Resolution {
  conflictId: string;
  assignedTo: string;
  reasoning: string;
  timestamp: number;
  scoreBreakdown?: AgentScore[];
}

interface AgentScore {
  agentId: string;
  total: number;
  breakdown: {
    capabilities: number;
    performance: number;
    workload: number;
    priority: number;
  };
}

export class ConflictResolverService {
  private static instance: ConflictResolverService;
  private messageBus: MessageBusService;
  private memoryService: MemoryService;
  private notificationService: NotificationService;
  private readonly ARBITRATOR_ID = 'conflict-resolver';

  private constructor() {
    this.messageBus = MessageBusService.getInstance();
    this.memoryService = MemoryService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): ConflictResolverService {
    if (!ConflictResolverService.instance) {
      ConflictResolverService.instance = new ConflictResolverService();
    }
    return ConflictResolverService.instance;
  }

  async detectConflict(
    task: TaskInfo,
    claimingAgents: RoleSpecificAgent[]
  ): Promise<boolean> {
    if (claimingAgents.length <= 1) return false;

    const conflict: ConflictDetails = {
      taskId: task.id,
      agents: claimingAgents.map(agent => agent.id),
      reason: 'Multiple agents claiming task ownership',
      priority: task.priority || 'medium',
      timestamp: Date.now(),
      taskRequirements: task.requiredCapabilities
    };

    // Store conflict details in memory
    await this.memoryService.storeMemory(
      JSON.stringify(conflict),
      'task',
      {
        taskId: task.id,
        tags: ['conflict', 'unresolved']
      }
    );

    // Notify about conflict detection
    await this.notificationService.notify(
      {
        title: 'Task Conflict Detected',
        content: `Multiple agents claiming task: ${task.id}`,
        priority: 'high',
        metadata: { conflict }
      },
      { slack: true, websocket: true }
    );

    await this.resolveConflict(conflict, claimingAgents);
    return true;
  }

  private async resolveConflict(
    conflict: ConflictDetails,
    agents: RoleSpecificAgent[]
  ): Promise<Resolution> {
    // Analyze agent capabilities and task requirements
    const agentCapabilities = await Promise.all(
      agents.map(async agent => {
        const performance = await this.memoryService.getAgentPerformance(agent.id);
        return {
          agentId: agent.id,
          capabilities: agent.role.requiredCapabilities,
          performance
        };
      })
    );

    // Calculate scores and select best agent
    const scores = await this.calculateAgentScores(agentCapabilities, conflict);
    const assignedTo = this.selectBestAgent(scores);

    const resolution: Resolution = {
      conflictId: conflict.taskId,
      assignedTo,
      reasoning: this.generateReasoning(scores, assignedTo),
      timestamp: Date.now(),
      scoreBreakdown: scores
    };

    // Store resolution in memory
    await this.memoryService.storeMemory(
      JSON.stringify(resolution),
      'task',
      {
        taskId: conflict.taskId,
        tags: ['conflict', 'resolved']
      }
    );

    // Notify about resolution
    await this.notifyResolution(resolution, conflict.agents);

    return resolution;
  }

  private async calculateAgentScores(
    agentCapabilities: Array<{
      agentId: string;
      capabilities: string[];
      performance: any;
    }>,
    conflict: ConflictDetails
  ): Promise<AgentScore[]> {
    return Promise.all(
      agentCapabilities.map(async agent => {
        const workload = await this.getCurrentWorkload(agent.agentId);
        
        const capabilityScore = this.calculateCapabilityScore(
          agent.capabilities,
          conflict.taskRequirements || []
        );
        
        const performanceScore = this.calculatePerformanceScore(
          agent.performance
        );
        
        const workloadScore = this.calculateWorkloadScore(workload);
        
        const priorityScore = this.calculatePriorityScore(
          conflict.priority,
          agent.performance
        );

        const total = (
          capabilityScore * 0.4 +
          performanceScore * 0.3 +
          workloadScore * 0.2 +
          priorityScore * 0.1
        );

        return {
          agentId: agent.agentId,
          total,
          breakdown: {
            capabilities: capabilityScore,
            performance: performanceScore,
            workload: workloadScore,
            priority: priorityScore
          }
        };
      })
    );
  }

  private calculateCapabilityScore(
    agentCapabilities: string[],
    taskRequirements: string[]
  ): number {
    if (taskRequirements.length === 0) return 1;
    
    const matchedCapabilities = taskRequirements.filter(
      req => agentCapabilities.includes(req)
    );
    
    return matchedCapabilities.length / taskRequirements.length;
  }

  private calculatePerformanceScore(performance: any): number {
    const {
      completionRate = 0.5,
      failureRate = 0.5,
      averageResponseTime = 1000
    } = performance;

    const normalizedResponseTime = Math.min(1, 1000 / averageResponseTime);

    return (
      completionRate * 0.4 +
      (1 - failureRate) * 0.4 +
      normalizedResponseTime * 0.2
    );
  }

  private async getCurrentWorkload(agentId: string): Promise<number> {
    const activeTasks = await this.memoryService.searchMemory('', {
      filter: {
        type: ['task'],
        agentId,
        tags: ['in_progress']
      }
    });

    return activeTasks.length;
  }

  private calculateWorkloadScore(workload: number): number {
    // Lower workload = higher score
    return Math.max(0, 1 - (workload * 0.2));
  }

  private calculatePriorityScore(
    priority: ConflictDetails['priority'],
    performance: any
  ): number {
    const priorityWeights = {
      high: 1,
      medium: 0.6,
      low: 0.3
    };

    return priorityWeights[priority] * (performance.completionRate || 0.5);
  }

  private selectBestAgent(scores: AgentScore[]): string {
    const bestAgent = scores.reduce((prev, current) => 
      prev.total > current.total ? prev : current
    );
    return bestAgent.agentId;
  }

  private generateReasoning(scores: AgentScore[], selectedAgentId: string): string {
    const selectedAgent = scores.find(s => s.id === selectedAgentId)!;
    const breakdown = selectedAgent.breakdown;

    return `Selected agent based on:
      - Capability match: ${(breakdown.capabilities * 100).toFixed(1)}%
      - Performance score: ${(breakdown.performance * 100).toFixed(1)}%
      - Current workload: ${(breakdown.workload * 100).toFixed(1)}%
      - Priority handling: ${(breakdown.priority * 100).toFixed(1)}%
      Total score: ${(selectedAgent.total * 100).toFixed(1)}%`;
  }

  private async notifyResolution(
    resolution: Resolution,
    agents: string[]
  ): Promise<void> {
    // Send detailed messages to each agent
    await Promise.all(
      agents.map(agentId =>
        this.messageBus.sendMessage(
          this.ARBITRATOR_ID,
          agentId,
          'Task Assignment Resolution',
          {
            ...resolution,
            isAssigned: agentId === resolution.assignedTo
          },
          'high'
        )
      )
    );

    // Broadcast resolution to monitoring systems
    await this.notificationService.notify(
      {
        title: 'Conflict Resolution Complete',
        content: resolution.reasoning,
        priority: 'medium',
        metadata: { resolution }
      },
      {
        slack: true,
        websocket: true,
        email: true
      }
    );
  }
}
