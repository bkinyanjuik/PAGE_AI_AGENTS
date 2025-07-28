import React, { useEffect, useState } from 'react';

const Agents = () => {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data);
    };

    fetchAgents();
  }, []);

  return (
    <div>
      <h2>Agents</h2>
      <ul>
        {agents.map((agent: any) => (
          <li key={agent.id}>{agent.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Agents;
