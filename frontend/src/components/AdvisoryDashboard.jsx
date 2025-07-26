import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AdvisoryDashboard = () => {
  const [advisories, setAdvisories] = useState({});
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchAdvisories();
    fetchTasks();
  }, []);

  const fetchAdvisories = async () => {
    try {
      const response = await fetch('/api/advisories');
      const data = await response.json();
      setAdvisories(data);
    } catch (error) {
      toast.error('Failed to fetch advisories');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const implementSuggestion = async (taskId, advisoryId) => {
    try {
      const response = await fetch(`/api/advisories/${advisoryId}/implement`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Suggestion implemented');
        fetchAdvisories();
      }
    } catch (error) {
      toast.error('Failed to implement suggestion');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">AI Advisory Dashboard</h2>
        
        {Object.entries(advisories).map(([taskId, taskAdvisories]) => {
          const task = tasks.find(t => t.task_id === taskId);
          if (!task) return null;

          return (
            <div key={taskId} className="mb-6 border rounded-lg p-4">
              <h3 className="font-medium text-lg">{task.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{task.description}</p>
              
              <div className="space-y-3">
                {taskAdvisories.map(advisory => (
                  <div 
                    key={advisory.advisory_id} 
                    className={`p-3 rounded-lg ${
                      advisory.implemented ? 'bg-green-50' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm">{advisory.suggestion}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence: {(advisory.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      {!advisory.implemented && (
                        <button
                          onClick={() => implementSuggestion(taskId, advisory.advisory_id)}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Implement
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvisoryDashboard;
