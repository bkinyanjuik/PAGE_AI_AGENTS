import Link from 'next/link';

const AgentCard = ({ agent }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    idle: 'bg-gray-100 text-gray-800',
    busy: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <Link href={`/agents/${agent.id}`} className="block">
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg hover:border-blue-500 border-2 border-transparent transition-all duration-200 cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{agent.role.name}</h3>
            <p className="text-sm text-gray-500">{agent.role.team}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[agent.state.status]}`}>
            {agent.state.status}
          </span>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-600">
            <p>Tasks Completed: {agent.state.performance.tasksCompleted}</p>
            <p>Success Rate: {agent.state.performance.successRate}%</p>
          </div>
          
          {agent.state.currentTask && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <p className="font-medium">Current Task:</p>
              <p className="text-gray-600 truncate">{agent.state.currentTask.title}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AgentCard;
