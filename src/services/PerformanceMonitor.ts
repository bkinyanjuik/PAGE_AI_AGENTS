import { RoleSpecificAgent, AgentPerformance } from '../types/agents';

export interface PerformanceMetrics {
  responseTime: number[];
  memoryUsage: number[];
  successRate: number;
  errorRate: number;
  throughput: number;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics>;
  private readonly maxHistorySize = 1000;

  constructor() {
    this.metrics = new Map();
  }

  recordExecution(agent: RoleSpecificAgent, executionTime: number, success: boolean): void {
    const agentMetrics = this.getOrCreateMetrics(agent.id);
    
    agentMetrics.responseTime.push(executionTime);
    agentMetrics.memoryUsage.push(process.memoryUsage().heapUsed);
    
    if (agentMetrics.responseTime.length > this.maxHistorySize) {
      agentMetrics.responseTime.shift();
      agentMetrics.memoryUsage.shift();
    }

    const totalExecutions = agent.state.performance.actionsExecuted;
    agentMetrics.successRate = (agent.state.performance.successfulActions / totalExecutions) * 100;
    agentMetrics.errorRate = 100 - agentMetrics.successRate;
    agentMetrics.throughput = totalExecutions / 
      ((Date.now() - agent.state.performance.lastActionTime.getTime()) / 1000);
  }

  getMetrics(agentId: string): PerformanceMetrics | undefined {
    return this.metrics.get(agentId);
  }

  private getOrCreateMetrics(agentId: string): PerformanceMetrics {
    if (!this.metrics.has(agentId)) {
      this.metrics.set(agentId, {
        responseTime: [],
        memoryUsage: [],
        successRate: 100,
        errorRate: 0,
        throughput: 0
      });
    }
    return this.metrics.get(agentId)!;
  }
}
