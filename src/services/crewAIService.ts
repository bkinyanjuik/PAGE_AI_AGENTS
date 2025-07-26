import { RoleSpecificAgent, TaskInfo, TaskResult } from '../types/agents';
import { MemoryService } from './memoryService';

interface CrewTask {
  id: string;
  assignee: string;
  reviewers: string[];
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  result?: TaskResult;
}

export class CrewAIService {
  private static instance: CrewAIService;
  private tasks: Map<string, CrewTask>;
  private agentGraph: Map<string, Set<string>>;
  private memoryService: MemoryService;

  private constructor() {
    this.tasks = new Map();
    this.agentGraph = new Map();
    this.memoryService = MemoryService.getInstance();
  }

  static getInstance(): CrewAIService {
    if (!CrewAIService.instance) {
      CrewAIService.instance = new CrewAIService();
    }
    return CrewAIService.instance;
  }

  registerAgent(agent: RoleSpecificAgent): void {
    if (!this.agentGraph.has(agent.id)) {
      this.agentGraph.set(agent.id, new Set());
    }

    // Set up collaboration connections based on team structure
    if (agent.role.crewPosition?.supervisor) {
      this.agentGraph.get(agent.id)?.add(agent.role.crewPosition.supervisor);
    }
    
    agent.role.crewPosition?.subordinates?.forEach(subordinateId => {
      this.agentGraph.get(agent.id)?.add(subordinateId);
    });
  }

  async assignTask(task: TaskInfo, agent: RoleSpecificAgent): Promise<void> {
    const crewTask: CrewTask = {
      id: task.id,
      assignee: agent.id,
      reviewers: this.getReviewers(agent),
      dependencies: task.dependencies || [],
      status: 'pending'
    };

    // Store task in short-term memory
    this.memoryService.setShortTermMemory(
      agent.id,
      'recentTasks',
      task
    );

    // Store task context in long-term memory
    await this.memoryService.storeMemory(
      JSON.stringify(task),
      'task',
      {
        agentId: agent.id,
        taskId: task.id,
        tags: ['task_assignment']
      }
    );

    this.tasks.set(task.id, crewTask);
    await this.notifyTaskAssignment(crewTask);
  }

  private getReviewers(agent: RoleSpecificAgent): string[] {
    const reviewers: string[] = [];
    if (agent.role.crewPosition?.supervisor) {
      reviewers.push(agent.role.crewPosition.supervisor);
    }
    return reviewers;
  }

  private async notifyTaskAssignment(task: CrewTask): Promise<void> {
    // Implement notification logic (WebSocket, email, etc.)
  }

  async updateTaskStatus(taskId: string, status: CrewTask['status'], result?: TaskResult): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.result = result;

      if (status === 'completed') {
        // Store task completion in long-term memory
        await this.memoryService.storeMemory(
          JSON.stringify({ task, result }),
          'task',
          {
            agentId: task.assignee,
            taskId: task.id,
            tags: ['task_completion']
          }
        );

        // Reset short-term memory for the task
        await this.memoryService.resetMemory(task.assignee);
      }

      await this.notifyTaskUpdate(task);
    }
  }

  private async notifyTaskUpdate(task: CrewTask): Promise<void> {
    // Implement update notification logic
  }

  // New memory-related methods
  async getTaskHistory(agentId: string): Promise<MemorySearchResult[]> {
    return await this.memoryService.searchMemory('', {
      filter: {
        type: ['task'],
        agentId,
        tags: ['task_completion']
      },
      limit: 100
    });
  }

  async getRelevantContext(query: string, agentId: string): Promise<MemorySearchResult[]> {
    return await this.memoryService.searchMemory(query, {
      filter: {
        agentId,
        timeRange: {
          start: Date.now() - (7 * 24 * 60 * 60 * 1000), // Last 7 days
          end: Date.now()
        }
      },
      limit: 5
    });
  }
}
