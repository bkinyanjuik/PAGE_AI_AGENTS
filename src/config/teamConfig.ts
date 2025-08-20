import { AgentRole, TeamType } from '../types/agents';
import { ModelProvider } from '../lib/config/modelConfig';

export const TechTeamRoles: Record<string, AgentRole> = {
  FRONTEND_LEAD: {
    name: 'Frontend Lead Developer',
    team: TeamType.TECH,
    specialization: ['frontend', 'UI/UX', 'react', 'typescript'],
    requiredCapabilities: [
      'code_generation',
      'code_review',
      'code_execution' // Add this line
    ],
    githubAccess: {
      repositories: ['frontend', 'shared-components'],
      permissions: ['write', 'admin']
    },
    crewPosition: {
      role: 'lead',
      subordinates: ['FRONTEND_DEV', 'UI_DESIGNER']
    }
  },
  BACKEND_LEAD: {
    name: 'Backend Lead Developer',
    team: TeamType.TECH,
    specialization: ['backend', 'api', 'database', 'system-design'],
    requiredCapabilities: [
      'code_generation', 
      'code_review',
      'code_execution' // Add this line
    ],
    githubAccess: {
      repositories: ['backend', 'api-services'],
      permissions: ['write', 'admin']
    }
  },
  AI_LEAD: {
    name: 'AI/ML Lead Developer',
    team: TeamType.TECH,
    specialization: ['machine-learning', 'deep-learning', 'model-training'],
    requiredCapabilities: [
      'code_generation',
      'technical_writing',
      'code_execution' // Add this line
    ],
    githubAccess: {
      repositories: ['ml-models', 'data-processing'],
      permissions: ['write', 'admin']
    }
  },
  DEVOPS_ENGINEER: {
    name: 'DevOps Engineer',
    team: TeamType.TECH,
    specialization: ['infrastructure', 'ci-cd', 'kubernetes'],
    requiredCapabilities: [
      'code_generation',
      'technical_writing',
      'code_execution' // Add this line
    ],
    githubAccess: {
      repositories: ['infra', 'deployment'],
      permissions: ['admin']
    }
  }
};

export const BusinessTeamRoles: Record<string, AgentRole> = {
  MARKETING_STRATEGIST: {
    name: 'Marketing Strategist',
    team: TeamType.BUSINESS,
    specialization: ['market-analysis', 'content-strategy', 'growth'],
    requiredCapabilities: ['reasoning', 'technical_writing'],
    githubAccess: {
      repositories: ['marketing-assets', 'documentation'],
      permissions: ['read', 'write']
    }
  },
  FINANCIAL_PLANNER: {
    name: 'Financial Planning Agent',
    team: TeamType.BUSINESS,
    specialization: ['financial-analysis', 'budgeting', 'forecasting'],
    requiredCapabilities: ['reasoning', 'technical_writing'],
    githubAccess: {
      repositories: ['financial-reports'],
      permissions: ['read', 'write']
    }
  },
  TAX_SPECIALIST: {
    name: 'Tax Compliance Specialist',
    team: TeamType.BUSINESS,
    specialization: ['tax-compliance', 'regulatory-reporting'],
    requiredCapabilities: ['reasoning'],
    githubAccess: {
      repositories: ['compliance-docs'],
      permissions: ['read', 'write']
    }
  }
};

export const ResearchTeamRoles: Record<string, AgentRole> = {
  RESEARCH_LEAD: {
    name: 'Research Lead',
    team: TeamType.RESEARCH,
    specialization: ['ai-research', 'innovation', 'architecture'],
    requiredCapabilities: ['reasoning', 'technical_writing'],
    githubAccess: {
      repositories: ['research', 'prototypes'],
      permissions: ['admin']
    }
  },
  INNOVATION_SCOUT: {
    name: 'Innovation Scout',
    team: TeamType.RESEARCH,
    specialization: ['trend-analysis', 'competitive-research'],
    requiredCapabilities: ['reasoning'],
    githubAccess: {
      repositories: ['research-docs'],
      permissions: ['read', 'write']
    }
  }
};
