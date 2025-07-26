import { EmailService } from './emailService';
import { WebSocketService } from '../utils/websocket';
import { WebClient } from '@slack/web-api';

interface NotificationConfig {
  email?: boolean;
  slack?: boolean;
  websocket?: boolean;
}

interface NotificationMessage {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export class NotificationService {
  private static instance: NotificationService;
  private emailService: EmailService;
  private wsService: WebSocketService;
  private slackClient?: WebClient;

  private constructor() {
    this.emailService = new EmailService();
    this.wsService = new WebSocketService();
    
    if (process.env.SLACK_BOT_TOKEN) {
      this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async notify(
    message: NotificationMessage,
    config: NotificationConfig,
    recipients?: string[]
  ): Promise<void> {
    const notifications: Promise<any>[] = [];

    if (config.email) {
      notifications.push(
        this.emailService.sendUpdate({
          subject: message.title,
          content: message.content,
          priority: message.priority,
          recipients
        })
      );
    }

    if (config.slack && this.slackClient) {
      notifications.push(
        this.sendSlackMessage(message)
      );
    }

    if (config.websocket) {
      this.wsService.broadcast({
        type: 'NOTIFICATION',
        payload: message
      });
    }

    await Promise.all(notifications);
  }

  private async sendSlackMessage(message: NotificationMessage): Promise<void> {
    if (!this.slackClient) return;

    const channel = process.env.SLACK_CHANNEL_ID || 'general';
    
    await this.slackClient.chat.postMessage({
      channel,
      text: message.title,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${message.title}*\n${message.content}`
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Priority: ${message.priority}`
            }
          ]
        }
      ]
    });
  }
}
