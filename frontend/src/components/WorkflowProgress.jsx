const WorkflowProgress = ({ workflow }) => {
  const getProgressColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-300';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-gray-900">{workflow.name}</h3>
          <p className="text-sm text-gray-500">{workflow.description}</p>
        </div>
        <span className="text-sm text-gray-600">
          {workflow.completedTasks}/{workflow.totalTasks} Tasks
        </span>
      </div>

      <div className="space-y-4">
        {workflow.tasks.map((task, index) => (
          <div key={task.id} className="relative">
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full ${getProgressColor(task.status)} flex items-center justify-center text-white text-sm`}>
                {index + 1}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{task.name}</p>
                <p className="text-sm text-gray-500">{task.agent}</p>
              </div>
              <span className="text-xs text-gray-500">{task.duration || '-'}</span>
            </div>
            {index < workflow.tasks.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-200"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowProgress;
