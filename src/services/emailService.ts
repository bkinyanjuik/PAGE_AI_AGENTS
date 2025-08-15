interface EmailConfig {
  subject: string;
  content: string;
  priority?: 'low' | 'medium' | 'high';
  recipients?: string[];
}

export class EmailService {
  private defaultRecipient: string;
  
  constructor() {
    console.log('[EmailService] Constructor called.');
    try {
      this.defaultRecipient = process.env.NEXT_PUBLIC_NOTIFICATION_EMAIL || '';
      console.log('[EmailService] Constructor finished successfully.');
    } catch (error) {
      console.error('[EmailService] Error during initialization:', error);
      throw error;
    }
  }

  async sendUpdate(config: EmailConfig): Promise<boolean> {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: config.recipients || [this.defaultRecipient],
          subject: config.subject,
          content: config.content,
          priority: config.priority || 'low'
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send email update:', error);
      return false;
    }
  }
}
