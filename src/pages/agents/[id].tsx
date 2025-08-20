import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RoleSpecificAgent } from '@/types/agents';

const AgentDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<RoleSpecificAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchAgent = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/agents?id=${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch agent details');
          }
          const data = await response.json();
          setAgent(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAgent();
    }
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading agent details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!agent) {
    return <div className="p-6">Agent not found.</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Agent Details: {agent.role.name}</h1>
        <p className="text-sm text-gray-500">ID: {agent.id}</p>
      </header>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Agent State</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="font-medium">Status:</span> {agent.state.status}</div>
          <div><span className="font-medium">Tasks Completed:</span> {agent.state.performance.tasksCompleted}</div>
          <div><span className="font-medium">Success Rate:</span> {agent.state.performance.successRate}%</div>
          <div><span className="font-medium">Avg. Response Time:</span> {agent.state.performance.averageResponseTime}ms</div>
          <div><span className="font-medium">Last Active:</span> {new Date(agent.state.performance.lastActive).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current Task</h2>
        {agent.state.currentTask ? (
          <div>
            <p><span className="font-medium">Title:</span> {agent.state.currentTask.title}</p>
            <p><span className="font-medium">Description:</span> {agent.state.currentTask.description}</p>
          </div>
        ) : (
          <p>No active task.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Model Configuration</h2>
        <p><span className="font-medium">Primary Model:</span> {agent.model.name}</p>
        <p>
          <span className="font-medium">Fallback Model:</span>{' '}
          {agent.fallbackModel ? agent.fallbackModel.name : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default AgentDetailPage;
