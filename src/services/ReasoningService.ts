import { LLMService, LLMRequest } from './llm/LLMService';
import { TaskInfo, TaskResult } from '../types/agents';
import { AgentToolkit } from '../types/tools';

export interface ReasoningStep {
  thought: string;
  action: string;
  actionInput?: any;
  result?: any;
}

export interface ExecutionPlan {
  steps: ReasoningStep[];
  estimatedDuration: number;
  requiredTools: string[];
}

export class ReasoningService {
  private llm: LLMService;
  private toolkit: AgentToolkit;

  constructor(llm: LLMService, toolkit: AgentToolkit) {
    this.llm = llm;
    this.toolkit = toolkit;
  }

  async planTask(task: TaskInfo): Promise<ExecutionPlan> {
    const planningPrompt = this.buildPlanningPrompt(task);
    const response = await this.llm.generateResponse({
      messages: [{
        role: 'system',
        content: 'You are a technical planning assistant. Break down tasks into concrete steps.'
      }, {
        role: 'user',
        content: planningPrompt
      }]
    });

    return this.parsePlanFromResponse(response.content);
  }

  async executeStep(step: ReasoningStep): Promise<any> {
    const toolName = step.action.toLowerCase();
    if (!(toolName in this.toolkit)) {
      throw new Error(`Tool ${toolName} not found in toolkit`);
    }

    try {
      const result = await this.toolkit[toolName](step.actionInput);
      return result;
    } catch (error) {
      console.error(`Error executing step: ${step.action}`, error);
      throw error;
    }
  }

  async executeTask(task: TaskInfo): Promise<TaskResult> {
    const plan = await this.planTask(task);
    const results = [];
    let success = true;

    for (const step of plan.steps) {
      try {
        const result = await this.executeStep(step);
        step.result = result;
        results.push(result);
      } catch (error) {
        success = false;
        break;
      }
    }

    return {
      taskId: task.id,
      success,
      output: results,
      metrics: {
        timeSpent: Date.now() - new Date(task.startTime).getTime(),
        resourcesUsed: plan.requiredTools,
        completionRate: success ? 100 : (results.length / plan.steps.length) * 100
      }
    };
  }

  private buildPlanningPrompt(task: TaskInfo): string {
    return `
Task Description: ${task.description}

Available Tools:
${Object.keys(this.toolkit).join('\n')}

Create a step-by-step plan to complete this task. For each step include:
1. The reasoning behind the step
2. The specific tool to use
3. The input parameters for the tool

Format your response as JSON with the following structure:
{
  "steps": [
    {
      "thought": "reasoning for this step",
      "action": "toolName",
      "actionInput": {
        // tool specific parameters
      }
    }
  ],
  "estimatedDuration": timeInMs,
  "requiredTools": ["tool1", "tool2"]
}
    `.trim();
  }

  private parsePlanFromResponse(response: string): ExecutionPlan {
    try {
      const plan = JSON.parse(response);
      // Validate plan structure
      if (!plan.steps || !Array.isArray(plan.steps)) {
        throw new Error('Invalid plan format');
      }
      return plan;
    } catch (error) {
      throw new Error(`Failed to parse execution plan: ${error}`);
    }
  }
}
