// Trivial change to force a new commit.
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AgentCard from './AgentCard';
import WorkflowProgress from './WorkflowProgress';
import TaskManagement from './TaskManagement';
import AdvisoryDashboard from './AdvisoryDashboard';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  
  useEffect(() => {
    // Fetch initial data
    fetchAgents();
    fetchWorkflows();
    
    // Set up WebSocket connection
    const ws = new WebSocket(`ws://${window.location.host}/ws`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'agent_update') {
        setAgents(prev => prev.map(agent => 
          agent.id === data.agent.id ? data.agent : agent
        ));
      } else if (data.type === 'workflow_update') {
        setWorkflows(prev => prev.map(workflow =>
          workflow.id === data.workflow.id ? data.workflow : workflow
        ));
      }
    };

    return () => ws.close();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setAgents(data);
      } else {
        console.error("Received non-array data for agents:", data);
        toast.error('Received invalid data for agents');
        setAgents([]); // Set to empty array to prevent crash
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      toast.error('Failed to fetch agents');
    }
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setWorkflows(data);
      } else {
        console.error("Received non-array data for workflows:", data);
        toast.error('Received invalid data for workflows');
        setWorkflows([]); // Set to empty array to prevent crash
      }
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
      toast.error('Failed to fetch workflows');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TaskManagement />;
      case 'advisory':
        return <AdvisoryDashboard />;
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Active Workflows</h2>
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <WorkflowProgress key={workflow.id} workflow={workflow} />
                ))}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AI Agent Dashboard (Test v2)</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded ${
              activeTab === 'overview' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded ${
              activeTab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Tasks
          </button>
          <button 
            onClick={() => setActiveTab('advisory')}
            className={`px-4 py-2 rounded ${
              activeTab === 'advisory' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Advisory
          </button>
        </div>
      </header>

      {renderContent()}
    </div>
  );
};

export default Dashboard;
