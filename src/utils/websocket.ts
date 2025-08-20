import { io, Socket } from 'socket.io-client';
import { RoleSpecificAgent, TaskInfo } from '../types/agents';

export class WebSocketClient {
  private socket: Socket | null = null;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    this.socket = io(this.url, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: Set<(data: any) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket() {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocketService] Connection established');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifySubscribers(data);
        } catch (error) {
          console.error('[WebSocketService] Error parsing message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocketService] Connection closed');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocketService] WebSocket error:', error);
      };

    } catch (error) {
      console.error('[WebSocketService] Error initializing WebSocket:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocketService] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.initializeWebSocket(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('[WebSocketService] Max reconnection attempts reached');
    }
  }

  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(data: any) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[WebSocketService] Error in subscriber callback:', error);
      }
    });
  }

  broadcastAgentUpdate(agent: RoleSpecificAgent) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'AGENT_UPDATE',
        payload: agent
      }));
    }
  }

  broadcast(data: { type: string, payload: any }) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  broadcastTaskUpdate(task: TaskInfo) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'TASK_UPDATE',
        payload: task
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }
}

export default WebSocketService;
