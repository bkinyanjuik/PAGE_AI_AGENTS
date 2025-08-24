export interface PromptTemplate {
  template: string;
  requiredVariables: string[];
}

export const promptTemplates = {
  taskPlanning: {
    template: `Given the following task and context:
Task: {{task}}
Available Tools: {{tools}}
Constraints: {{constraints}}

Create a detailed plan with the following:
1. Task breakdown into smaller subtasks
2. Required tools and resources for each subtask
3. Potential risks and mitigation strategies
4. Success criteria for each subtask

Respond in JSON format.`,
    requiredVariables: ['task', 'tools', 'constraints']
  },
  
  codeReview: {
    template: `Review the following code changes:
{{changes}}

Consider:
1. Code quality and best practices
2. Potential security issues
3. Performance implications
4. Test coverage

Provide feedback in JSON format.`,
    requiredVariables: ['changes']
  },

  errorResolution: {
    template: `An error occurred during task execution:
Error: {{error}}
Context: {{context}}
Previous Actions: {{previousActions}}

Analyze the error and propose a resolution strategy.
Response should include:
1. Root cause analysis
2. Proposed fix
3. Prevention measures

Respond in JSON format.`,
    requiredVariables: ['error', 'context', 'previousActions']
  }
};

export function compileTemplate(
  templateName: keyof typeof promptTemplates,
  variables: Record<string, string>
): string {
  const template = promptTemplates[templateName];
  let result = template.template;

  for (const variable of template.requiredVariables) {
    if (!(variable in variables)) {
      throw new Error(`Missing required variable: ${variable}`);
    }
    result = result.replace(
      new RegExp(`{{${variable}}}`, 'g'),
      variables[variable]
    );
  }

  return result;
}
