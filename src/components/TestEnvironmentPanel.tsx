import React, { useState, useEffect } from 'react';
import { DockerTestService } from '../services/dockerTestService';

interface Props {
  agentId: string;
}

export const TestEnvironmentPanel: React.FC<Props> = ({ agentId }) => {
  const [environments, setEnvironments] = useState<TestEnvironment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [dockerfile, setDockerfile] = useState('');
  const [composefile, setComposefile] = useState('');

  const dockerService = DockerTestService.getInstance();

  useEffect(() => {
    loadTestHistory();
    subscribeToUpdates();
  }, [agentId]);

  const loadTestHistory = async () => {
    const history = await dockerService.getTestHistory(agentId);
    setEnvironments(history);
  };

  const subscribeToUpdates = () => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'TEST_UPDATE' && data.agentId === agentId) {
        updateEnvironmentData(data.environmentId);
      }
    };
    return () => ws.close();
  };

  const updateEnvironmentData = async (envId: string) => {
    const env = await dockerService.getEnvironment(envId);
    if (env) {
      setEnvironments(prev => 
        [env, ...prev.filter(e => e.id !== envId)]
      );
      if (selectedEnv === envId) {
        setLogs(env.logs);
      }
    }
  };

  const handleCreateEnvironment = async () => {
    try {
      const envId = await dockerService.createTestEnvironment(
        agentId,
        dockerfile,
        composefile
      );
      await dockerService.runTests(envId);
      setSelectedEnv(envId);
    } catch (error) {
      console.error('Failed to create test environment:', error);
    }
  };

  const handleEnvSelect = async (envId: string) => {
    setSelectedEnv(envId);
    const env = await dockerService.getEnvironment(envId);
    if (env) {
      setLogs(env.logs);
    }
  };

  return (
    <div className="test-environment-panel">
      <div className="test-controls">
        <h3>Create Test Environment</h3>
        <div className="file-editors">
          <div className="file-editor">
            <h4>Dockerfile</h4>
            <textarea
              value={dockerfile}
              onChange={(e) => setDockerfile(e.target.value)}
              placeholder="Enter Dockerfile contents..."
            />
          </div>
          <div className="file-editor">
            <h4>docker-compose.yml</h4>
            <textarea
              value={composefile}
              onChange={(e) => setComposefile(e.target.value)}
              placeholder="Enter docker-compose.yml contents..."
            />
          </div>
        </div>
        <button
          onClick={handleCreateEnvironment}
          disabled={!dockerfile || !composefile}
        >
          Create & Run Tests
        </button>
      </div>

      <div className="test-environments">
        <h3>Test Environments</h3>
        <div className="environment-list">
          {environments.map(env => (
            <div
              key={env.id}
              className={`environment-card ${selectedEnv === env.id ? 'selected' : ''}`}
              onClick={() => handleEnvSelect(env.id)}
            >
              <div className="env-header">
                <span className={`status ${env.status}`}>
                  {env.status}
                </span>
                <span className="timestamp">
                  {new Date(env.startTime).toLocaleString()}
                </span>
              </div>
              {env.results && (
                <div className="test-results">
                  <div className="metric">
                    <span>Build Time:</span>
                    <span>{env.results.buildTime}s</span>
                  </div>
                  <div className="metric">
                    <span>Tests:</span>
                    <span className="passed">{env.results.testsPassed} ?</span>
                    <span className="failed">{env.results.testsFailed} ?</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedEnv && (
        <div className="test-logs">
          <h3>Test Logs</h3>
          <div className="log-viewer">
            {logs.map((log, index) => (
              <div key={index} className="log-line">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

