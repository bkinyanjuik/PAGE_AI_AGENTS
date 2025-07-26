import { NextApiRequest, NextApiResponse } from 'next';
import { NotificationService } from '../../services/notificationService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { to, subject, content, priority } = req.body;
        const notificationService = NotificationService.getInstance();
        await notificationService.notify(
          {
            title: subject,
            content: content,
            priority: priority || 'medium',
          },
          { email: true },
          to
        );
        return res.status(200).json({ message: 'Email sent' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to send email' });
      }
    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
