import { v4 as uuidv4 } from 'uuid';
import { MemoryService } from './memoryService';

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: any;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  status: 'unread' | 'read' | 'archived';
}

interface MessageFilter {
  from?: string;
  to?: string;
  status?: Message['status'];
  priority?: Message['priority'];
  timeRange?: {
    start: number;
    end: number;
  };
}

export class MessageBusService {
  private static instance: MessageBusService;
  private memoryService: MemoryService;
  private messageHandlers: Map<string, ((message: Message) => Promise<void>)[]>;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
    this.messageHandlers = new Map();
  }

  static getInstance(): MessageBusService {
    if (!MessageBusService.instance) {
      MessageBusService.instance = new MessageBusService();
    }
    return MessageBusService.instance;
  }

  async sendMessage(
    from: string,
    to: string,
    subject: string,
    content: any,
    priority: Message['priority'] = 'low'
  ): Promise<string> {
    const message: Message = {
      id: uuidv4(),
      from,
      to,
      subject,
      content,
      priority,
      timestamp: Date.now(),
      status: 'unread'
    };

    await this.memoryService.storeMemory(
      JSON.stringify(message),
      'conversation',
      {
        from,
        to,
        messageId: message.id,
        tags: ['message', priority]
      }
    );

    // Trigger handlers for recipient
    const handlers = this.messageHandlers.get(to) || [];
    await Promise.all(handlers.map(handler => handler(message)));

    return message.id;
  }

  async getMessages(to: string, filter?: MessageFilter): Promise<Message[]> {
    const searchFilter: any = {
      type: ['conversation'],
      tags: ['message']
    };

    if (filter?.from) searchFilter.from = filter.from;
    if (filter?.status) searchFilter.status = filter.status;
    if (filter?.priority) searchFilter.tags.push(filter.priority);
    if (filter?.timeRange) searchFilter.timeRange = filter.timeRange;

    const results = await this.memoryService.searchMemory('', {
      filter: searchFilter
    });

    return results.map(result => JSON.parse(result.metadata.content));
  }

  onMessage(agentId: string, handler: (message: Message) => Promise<void>): void {
    if (!this.messageHandlers.has(agentId)) {
      this.messageHandlers.set(agentId, []);
    }
    this.messageHandlers.get(agentId)?.push(handler);
  }
}
