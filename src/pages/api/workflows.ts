import { NextApiRequest, NextApiResponse } from 'next';
import { CrewAIService } from '../../services/crewAIService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const crewAIService = CrewAIService.getInstance();

  switch (method) {
    case 'GET':
      const workflows = await crewAIService.getWorkflows();
      return res.status(200).json(workflows);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
