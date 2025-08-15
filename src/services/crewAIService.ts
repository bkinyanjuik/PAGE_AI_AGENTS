import { RoleSpecificAgent, TaskInfo, TaskResult } from '../types/agents';
import { MemoryService } from './memoryService';
import { MemorySearchResult } from '../types/memory';

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
    console.log('[CrewAIService] Constructor called.');
    try {
      this.tasks = new Map();
      this.agentGraph = new Map();
      this.memoryService = MemoryService.getInstance();
      console.log('[CrewAIService] MemoryService instance obtained.');
      console.log('[CrewAIService] Constructor finished successfully.');
    } catch (error) {
      console.error('[CrewAIService] Error during initialization:', error);
      throw error;
    }
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

  async getAdvisories(): Promise<any> {
    // TODO: Implement actual advisory fetching
    return {
      "task-1": [
        {
          "advisory_id": "adv-1",
          "suggestion": "Consider using a more efficient algorithm.",
          "confidence": 0.8,
          "implemented": false
        },
        {
          "advisory_id": "adv-2",
          "suggestion": "Refactor the database schema for better performance.",
          "confidence": 0.9,
          "implemented": true
        }
      ]
    };
  }

  async getTasks(): Promise<any> {
    // TODO: Implement actual task fetching
    return [
      {
        "task_id": "task-1",
        "title": "Optimize the database",
        "description": "The current database is slow and needs to be optimized.",
        "assigned_to": "agent-1",
        "priority": "HIGH"
      },
      {
        "task_id": "task-2",
        "title": "Implement the new UI",
        "description": "The new UI needs to be implemented for the dashboard.",
        "assigned_to": "agent-2",
        "priority": "MEDIUM"
      }
    ];
  }

  async getWorkflows(): Promise<any> {
    // TODO: Implement actual workflow fetching
    return [
      {
        "id": "wf-1",
        "name": "Data Processing Workflow",
        "description": "A workflow for processing data.",
        "completedTasks": 2,
        "totalTasks": 5,
        "tasks": [
          { "id": "t-1", "name": "Fetch Data", "agent": "Data Fetcher", "status": "completed", "duration": "2m" },
          { "id": "t-2", "name": "Clean Data", "agent": "Data Cleaner", "status": "completed", "duration": "5m" },
          { "id": "t-3", "name": "Analyze Data", "agent": "Data Analyst", "status": "in_progress" },
          { "id": "t-4", "name": "Generate Report", "agent": "Report Generator", "status": "pending" },
          { "id": "t-5", "name": "Send Report", "agent": "Notifier", "status": "pending" }
        ]
      }
    ];
  }
}
