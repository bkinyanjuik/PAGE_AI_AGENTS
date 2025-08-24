import { RoleSpecificAgent, AgentState } from '../types/agents';
import { FileOperations } from '../tools/FileOperations';

export class AgentStateManager {
  private fileOps: FileOperations;
  private stateDirectory: string;

  constructor(basePath: string) {
    this.fileOps = new FileOperations(basePath);
    this.stateDirectory = 'agent-states';
  }

  async persistState(agent: RoleSpecificAgent): Promise<void> {
    const statePath = `${this.stateDirectory}/${agent.id}.json`;
    const stateData = {
      timestamp: new Date().toISOString(),
      state: agent.state,
      performance: agent.state.performance,
      currentTask: agent.state.currentTask
    };

    await this.fileOps.write(statePath, JSON.stringify(stateData, null, 2));
  }

  async loadState(agentId: string): Promise<AgentState | null> {
    const statePath = `${this.stateDirectory}/${agentId}.json`;
    
    if (await this.fileOps.exists(statePath)) {
      const stateData = await this.fileOps.read(statePath);
      return JSON.parse(stateData);
    }
    
    return null;
  }
}
