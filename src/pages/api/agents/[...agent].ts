import { NextApiRequest, NextApiResponse } from 'next';
import { AgentService } from '../../../services/agentService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req;
  const agentService = AgentService.getInstance();
  const agentParams = query.agent as string[];

  switch (method) {
    case 'GET':
      if (agentParams && agentParams.length > 0) {
        const agentId = agentParams[0];
        const agent = agentService.getAgent(agentId);
        if (agent) {
          return res.status(200).json(agent);
        } else {
          return res.status(404).json({ error: 'Agent not found' });
        }
      } else {
        const agents = agentService.getAllAgents();
        return res.status(200).json(agents);
      }
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
