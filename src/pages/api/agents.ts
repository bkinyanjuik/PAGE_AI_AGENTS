import { NextApiRequest, NextApiResponse } from 'next';
import { AgentService } from '../../services/agentService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const agentService = AgentService.getInstance();
  switch (method) {
    case 'GET':
      const agents = agentService.getAllAgents();
      console.log(`[API /api/agents] Sending data:`, JSON.stringify(agents, null, 2));
      return res.status(200).json(agents);
    case 'POST':
      try {
        const { role } = req.body;
        const newAgent = await agentService.createAgent(role);
        return res.status(201).json(newAgent);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create agent' });
      }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
