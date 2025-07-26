import { useState } from 'react';
import { RoleSpecificAgent, ModelConfig } from '@/types/agents';

export class BaseRoleSpecificAgent implements RoleSpecificAgent {
  name: string;
  primaryModel: ModelConfig;
  fallbackModels: ModelConfig[];
  currentModel: ModelConfig;
  kwargs: Record<string, any>;

  constructor(
    name: string,
    primaryModel: ModelConfig,
    fallbackModels: ModelConfig[] = [],
    kwargs: Record<string, any> = {}
  ) {
    this.name = name;
    this.primaryModel = primaryModel;
    this.fallbackModels = fallbackModels;
    this.currentModel = primaryModel;
    this.kwargs = kwargs;
  }

  async fallbackToNextModel(): Promise<boolean> {
    if (this.fallbackModels.length === 0) {
      return false;
    }
    
    this.currentModel = this.fallbackModels[0];
    this.fallbackModels = this.fallbackModels.slice(1);
    return true;
  }
}

// Specialized agent implementations
export class BackendEngineer extends BaseRoleSpecificAgent {}
export class FrontendDeveloper extends BaseRoleSpecificAgent {}
export class DevOpsEngineer extends BaseRoleSpecificAgent {}
export class TechLead extends BaseRoleSpecificAgent {}
export class AgentArchitect extends BaseRoleSpecificAgent {}
export class QAEngineer extends BaseRoleSpecificAgent {}
