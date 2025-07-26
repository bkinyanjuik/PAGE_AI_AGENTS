import { AgentRole, RoleSpecificAgent, TeamType } from '../types/agents';
import { AgentService } from '../services/agentService';
import { GitHubService } from '../services/githubService';
import { CrewAIService } from '../services/crewAIService';
import { 
  TechTeamRoles, 
  BusinessTeamRoles, 
  ResearchTeamRoles 
} from '../config/teamConfig';

export class AgentFactory {
  private static agentService = AgentService.getInstance();
  private static githubService = GitHubService.getInstance();
  private static crewAIService = CrewAIService.getInstance();

  static async createAgent(role: AgentRole): Promise<RoleSpecificAgent> {
    const agent = await this.agentService.createAgent(role);
    
    // Register agent with CrewAI
    this.crewAIService.registerAgent(agent);
    
    return agent;
  }

  static async initializeTechTeam(): Promise<RoleSpecificAgent[]> {
    const agents = await Promise.all(
      Object.values(TechTeamRoles).map(role => this.createAgent(role))
    );
    return agents;
  }

  static async initializeBusinessTeam(): Promise<RoleSpecificAgent[]> {
    const agents = await Promise.all(
      Object.values(BusinessTeamRoles).map(role => this.createAgent(role))
    );
    return agents;
  }

  static async initializeResearchTeam(): Promise<RoleSpecificAgent[]> {
    const agents = await Promise.all(
      Object.values(ResearchTeamRoles).map(role => this.createAgent(role))
    );
    return agents;
  }

  static async initializeFullWorkforce(): Promise<{
    techTeam: RoleSpecificAgent[];
    businessTeam: RoleSpecificAgent[];
    researchTeam: RoleSpecificAgent[];
  }> {
    const [techTeam, businessTeam, researchTeam] = await Promise.all([
      this.initializeTechTeam(),
      this.initializeBusinessTeam(),
      this.initializeResearchTeam()
    ]);

    return {
      techTeam,
      businessTeam,
      researchTeam
    };
  }
}
