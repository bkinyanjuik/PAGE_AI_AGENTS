import { LLMService } from './llm/LLMService';
import { RoleSpecificAgent } from '../types/agents';
import { compileTemplate } from '../config/prompts/templates';

export interface Conflict {
  type: 'resource' | 'code' | 'dependency';
  description: string;
  agents: string[];
  resources: string[];
}

export interface Resolution {
  action: string;
  assignments: Record<string, string[]>;
  rationale: string;
}

export class ConflictResolver {
  private llm: LLMService;

  constructor(llm: LLMService) {
    this.llm = llm;
  }

  async resolveConflict(
    conflict: Conflict,
    agents: Map<string, RoleSpecificAgent>
  ): Promise<Resolution> {
    const context = this.buildContext(conflict, agents);
    const response = await this.llm.generateResponse({
      messages: [{
        role: 'system',
        content: this.buildResolutionPrompt(context)
      }]
    });

    return this.parseResolution(response.content);
  }

  private buildContext(
    conflict: Conflict,
    agents: Map<string, RoleSpecificAgent>
  ): any {
    return {
      conflict,
      agents: Array.from(agents.entries()).map(([id, agent]) => ({
        id,
        role: agent.role.name,
        capabilities: agent.role.requiredCapabilities,
        currentLoad: agent.state.performance.actionsExecuted
      }))
    };
  }

  private buildResolutionPrompt(context: any): string {
    return compileTemplate('conflictResolution', {
      conflict: JSON.stringify(context.conflict),
      agents: JSON.stringify(context.agents)
    });
  }

  private parseResolution(content: string): Resolution {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse resolution: ${error}`);
    }
  }
}
