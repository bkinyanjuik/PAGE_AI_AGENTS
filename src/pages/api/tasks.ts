import { NextApiRequest, NextApiResponse } from 'next';
import { CrewAIService } from '../../services/crewAIService';
import { AgentService } from '../../services/agentService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const crewAIService = CrewAIService.getInstance();
  const agentService = AgentService.getInstance();

  switch (method) {
    case 'GET':
      const tasks = await crewAIService.getTasks();
      return res.status(200).json(tasks);
    case 'POST':
      try {
        const { title, description, assigned_to, priority } = req.body;
        const agent = agentService.getAgent(assigned_to);
        if (!agent) {
          return res.status(404).json({ error: 'Agent not found' });
        }
        // This is a simplified task creation, we'll need to expand on this
        await crewAIService.assignTask({ id: `task-${Date.now()}`, title, description, priority }, agent);
        return res.status(200).json({ message: 'Task created' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create task' });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
