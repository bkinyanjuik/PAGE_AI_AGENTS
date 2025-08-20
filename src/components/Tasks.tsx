import React, { useEffect, useState } from 'react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    };

    fetchTasks();
  }, []);

  return (
    <div>
      <h2>Tasks</h2>
      <ul>
        {tasks.map((task: any) => (
          <li key={task.task_id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
