import React, { useEffect, useState } from 'react';

const Workflows = () => {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    const fetchWorkflows = async () => {
      const res = await fetch('/api/workflows');
      const data = await res.json();
      setWorkflows(data);
    };

    fetchWorkflows();
  }, []);

  return (
    <div>
      <h2>Workflows</h2>
      <ul>
        {workflows.map((workflow: any) => (
          <li key={workflow.id}>{workflow.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Workflows;
