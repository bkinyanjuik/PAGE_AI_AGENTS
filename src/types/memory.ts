export interface MemoryVector {
  id: string;
  vector: number[];
  metadata: MemoryVectorMetadata;
}

export interface MemorySearchResult {
  id: string;
  score: number;
  metadata: MemoryVector['metadata'];
}

export interface ShortTermMemory {
  recentTasks: Map<string, TaskInfo>;
  conversationContext: Map<string, string[]>;
  temporaryNotes: Map<string, string>;
}

export interface MemoryConfig {
  vectorDbUrl: string;
  collectionName: string;
  dimension: number;
  shortTermTTL: number; // Time in milliseconds
  similarityThreshold: number;
}

export interface MemoryQueryOptions {
  limit?: number;
  minSimilarity?: number;
  filter?: {
    type?: MemoryVector['metadata']['type'][];
    agentId?: string;
    taskId?: string;
    tags?: string[];
    timeRange?: {
      start: number;
      end: number;
    };
  };
}

// Add new interfaces
export interface AgentPerformanceMetrics {
  completionRate: number;
  failureRate: number;
  averageResponseTime: number;
  taskSuccessCount: number;
  taskFailureCount: number;
  feedbackScore: number;
  lastUpdated: number;
}

export interface PostmortemAnalysis {
  taskId: string;
  agentId: string;
  failureReason: string;
  impactAnalysis: string;
  recommendedActions: string[];
  relatedIncidents: string[];
  timestamp: number;
}

export interface HumanFeedback {
  taskId: string;
  agentId: string;
  rating: number; // 1-5
  comments: string;
  category: 'quality' | 'speed' | 'accuracy' | 'communication';
  timestamp: number;
}

// Extend MemoryVector metadata
export interface MemoryVectorMetadata {
  type: 'task' | 'conversation' | 'document' | 'code' | 'performance' | 'postmortem' | 'feedback' | 'log' | 'test';
  content: string;
  timestamp: number;
  agentId?: string;
  taskId?: string;
  tags?: string[];
  metrics?: Partial<AgentPerformanceMetrics>;
  analysis?: PostmortemAnalysis;
  feedback?: HumanFeedback;
}
