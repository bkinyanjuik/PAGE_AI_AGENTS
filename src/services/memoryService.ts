import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';
import {
  MemoryVector,
  MemorySearchResult,
  ShortTermMemory,
  MemoryQueryOptions,
  AgentPerformanceMetrics,
  PostmortemAnalysis,
  HumanFeedback
} from '@/types/memory';
import { MEMORY_CONFIG, MEMORY_COLLECTIONS } from '@/config/memoryConfig';
import { EmbeddingsService } from '@/services/embeddingsService';

export class MemoryService {
  private static instance: MemoryService;
  private qdrant: QdrantClient | null;
  private embeddings: EmbeddingsService;
  private shortTermMemory: ShortTermMemory;

  private constructor() {
    try {
      this.qdrant = new QdrantClient({ url: MEMORY_CONFIG.vectorDbUrl });
    } catch (error) {
      console.warn("Failed to connect to Qdrant. Memory service will be disabled.", error);
      this.qdrant = null;
    }
    this.embeddings = EmbeddingsService.getInstance();
    this.shortTermMemory = {
      recentTasks: new Map(),
      conversationContext: new Map(),
      temporaryNotes: new Map()
    };
  }

  static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  async storeMemory(
    content: string,
    type: MemoryVector['metadata']['type'],
    metadata: Partial<MemoryVector['metadata']>
  ): Promise<string> {
    if (!this.qdrant) {
      console.warn("Qdrant not available, skipping storeMemory.");
      return "";
    }
    const vector = await this.embeddings.createEmbedding(content);
    const memoryVector: MemoryVector = {
      id: uuidv4(),
      vector,
      metadata: {
        type,
        content,
        timestamp: Date.now(),
        ...metadata
      }
    };

    await this.qdrant.upsert(MEMORY_CONFIG.collectionName, {
      points: [{
        id: memoryVector.id,
        vector: memoryVector.vector,
        payload: memoryVector.metadata
      }]
    });

    return memoryVector.id;
  }

  async searchMemory(
    query: string,
    options: MemoryQueryOptions = {}
  ): Promise<MemorySearchResult[]> {
    if (!this.qdrant) {
      console.warn("Qdrant not available, skipping searchMemory.");
      return [];
    }
    const queryVector = await this.embeddings.createEmbedding(query);
    const response = await this.qdrant.search(MEMORY_CONFIG.collectionName, {
      vector: queryVector,
      limit: options.limit || 10,
      score_threshold: options.minSimilarity || MEMORY_CONFIG.similarityThreshold,
      filter: this.buildSearchFilter(options.filter)
    });

    return response.map(hit => ({
      id: hit.id as string,
      score: hit.score,
      metadata: hit.payload as MemoryVector['metadata']
    }));
  }

  private buildSearchFilter(filter?: MemoryQueryOptions['filter']) {
    if (!filter) return undefined;

    const conditions = [];
    if (filter.type) {
      conditions.push({ key: 'type', match: { any: filter.type } });
    }
    if (filter.agentId) {
      conditions.push({ key: 'agentId', match: { value: filter.agentId } });
    }
    if (filter.taskId) {
      conditions.push({ key: 'taskId', match: { value: filter.taskId } });
    }
    if (filter.tags) {
      conditions.push({ key: 'tags', match: { any: filter.tags } });
    }
    if (filter.timeRange) {
      conditions.push({
        key: 'timestamp',
        range: {
          gte: filter.timeRange.start,
          lte: filter.timeRange.end
        }
      });
    }

    return { must: conditions };
  }

  // Short-term memory management
  setShortTermMemory(
    agentId: string,
    key: keyof ShortTermMemory,
    value: any
  ): void {
    const memory = this.shortTermMemory[key] as Map<string, any>;
    memory.set(agentId, value);

    // Schedule cleanup after TTL
    setTimeout(() => {
      memory.delete(agentId);
    }, MEMORY_CONFIG.shortTermTTL);
  }

  getShortTermMemory<T>(
    agentId: string,
    key: keyof ShortTermMemory
  ): T | undefined {
    const memory = this.shortTermMemory[key] as Map<string, T>;
    return memory.get(agentId);
  }

  async resetMemory(agentId: string): Promise<void> {
    // Clear short-term memory
    Object.values(this.shortTermMemory).forEach(memory => {
      memory.delete(agentId);
    });

    if (!this.qdrant) {
      return;
    }

    // Archive long-term memories for the agent
    const memories = await this.searchMemory('', {
      filter: { agentId }
    });

    // Archive or delete based on your requirements
    for (const memory of memories) {
      await this.qdrant.delete(MEMORY_CONFIG.collectionName, {
        points: [memory.id]
      });
    }
  }

  // Performance Tracking
  async trackAgentPerformance(agentId: string, metrics: Partial<AgentPerformanceMetrics>): Promise<void> {
    const currentMetrics = await this.getAgentPerformance(agentId);
    const updatedMetrics: AgentPerformanceMetrics = {
      ...currentMetrics,
      ...metrics,
      lastUpdated: Date.now()
    };

    await this.storeMemory(
      JSON.stringify(updatedMetrics),
      'performance',
      {
        agentId,
        metrics: updatedMetrics,
        tags: ['performance_metrics']
      }
    );
  }

  async getAgentPerformance(agentId: string): Promise<AgentPerformanceMetrics> {
    const results = await this.searchMemory('', {
      filter: {
        type: ['performance'],
        agentId,
        tags: ['performance_metrics']
      },
      limit: 1
    });

    if (results.length === 0) {
      return {
        completionRate: 0,
        failureRate: 0,
        averageResponseTime: 0,
        taskSuccessCount: 0,
        taskFailureCount: 0,
        feedbackScore: 0,
        lastUpdated: Date.now()
      };
    }

    return results[0].metadata.metrics as AgentPerformanceMetrics;
  }

  // Postmortem Generation
  async generatePostmortem(
    taskId: string,
    agentId: string,
    error: Error | string,
    context: any
  ): Promise<PostmortemAnalysis> {
    const relatedIncidents = await this.findRelatedIncidents(error.toString());
    
    const postmortem: PostmortemAnalysis = {
      taskId,
      agentId,
      failureReason: error.toString(),
      impactAnalysis: this.analyzeImpact(context),
      recommendedActions: this.generateRecommendations(error.toString(), relatedIncidents),
      relatedIncidents: relatedIncidents.map(i => i.id),
      timestamp: Date.now()
    };

    await this.storeMemory(
      JSON.stringify(postmortem),
      'postmortem',
      {
        agentId,
        taskId,
        analysis: postmortem,
        tags: ['failure_analysis']
      }
    );

    return postmortem;
  }

  private async findRelatedIncidents(error: string): Promise<MemorySearchResult[]> {
    return await this.searchMemory(error, {
      filter: {
        type: ['postmortem'],
        tags: ['failure_analysis']
      },
      limit: 5
    });
  }

  private analyzeImpact(context: any): string {
    // Implement impact analysis logic
    return 'Impact analysis based on context';
  }

  private generateRecommendations(error: string, relatedIncidents: MemorySearchResult[]): string[] {
    // Implement recommendation generation logic
    return ['Recommendation 1', 'Recommendation 2'];
  }

  // Human Feedback
  async storeFeedback(feedback: HumanFeedback): Promise<void> {
    await this.storeMemory(
      JSON.stringify(feedback),
      'feedback',
      {
        agentId: feedback.agentId,
        taskId: feedback.taskId,
        feedback,
        tags: ['human_feedback', feedback.category]
      }
    );

    // Update agent's performance metrics with feedback
    const currentMetrics = await this.getAgentPerformance(feedback.agentId);
    await this.trackAgentPerformance(feedback.agentId, {
      feedbackScore: (currentMetrics.feedbackScore + feedback.rating) / 2
    });
  }

  async getAgentFeedback(
    agentId: string,
    timeRange?: { start: number; end: number }
  ): Promise<HumanFeedback[]> {
    const results = await this.searchMemory('', {
      filter: {
        type: ['feedback'],
        agentId,
        tags: ['human_feedback'],
        timeRange
      }
    });

    return results.map(result => result.metadata.feedback as HumanFeedback);
  }
}
