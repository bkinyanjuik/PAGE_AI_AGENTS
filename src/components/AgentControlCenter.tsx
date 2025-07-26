import React, { useState, useEffect } from 'react';
import { AgentProfile, AgentLog, AgentControlCommand } from '../types/agents';
import { AgentControlService } from '../services/agentControlService';

export const AgentControlCenter: React.FC = () => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [taskInput, setTaskInput] = useState<string>('');

  const agentControl = AgentControlService.getInstance();

  useEffect(() => {
    // Subscribe to agent updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'AGENT_UPDATE') {
        updateAgentData();
      }
    };

    return () => ws.close();
  }, []);

  const updateAgentData = async () => {
    const updatedAgents = await Promise.all(
      agents.map(agent => agentControl.getAgentProfile(agent.id))
    );
    setAgents(updatedAgents.filter(Boolean) as AgentProfile[]);
  };

  const handleAgentSelect = async (agentId: string) => {
    setSelectedAgent(agentId);
    const logs = await agentControl.getAgentLogs(agentId);
    setLogs(logs);
  };

  const handleTriggerAgent = async () => {
    if (!selectedAgent || !taskInput) return;

    const command: AgentControlCommand = {
      type: 'trigger',
      agentId: selectedAgent,
      taskInput: JSON.parse(taskInput),
      priority: 'medium'
    };

    await agentControl.triggerAgent(command);
    setTaskInput('');
  };

  return (
    <div className="agent-control-center">
      <div className="agent-list">
        {agents.map(agent => (
          <div
            key={agent.id}
            className={`agent-card ${selectedAgent === agent.id ? 'selected' : ''}`}
            onClick={() => handleAgentSelect(agent.id)}
          >
            <h3>{agent.name}</h3>
            <div className={`status-indicator ${agent.status.state}`}>
              {agent.status.state}
            </div>
          </div>
        ))}
      </div>

      {selectedAgent && (
        <div className="agent-details">
          <div className="agent-profile">
            <h2>Agent Profile</h2>
            <div className="profile-content">
              {/* Display agent profile information */}
            </div>
          </div>

          <div className="agent-trigger">
            <h3>Trigger Agent</h3>
            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter task input (JSON format)"
            />
            <button
              onClick={handleTriggerAgent}
              disabled={!taskInput}
            >
              Trigger Agent
            </button>
          </div>

          <div className="agent-logs">
            <h3>Agent Logs</h3>
            <div className="log-list">
              {logs.map(log => (
                <div key={log.id} className={`log-entry ${log.type}`}>
                  <span className="timestamp">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="content">{log.content}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
