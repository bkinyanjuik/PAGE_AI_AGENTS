import { ToolConfig } from '../types/tools';

export const toolConfigs: Record<string, ToolConfig> = {
  runCode: {
    name: 'RunCode',
    description: 'Execute code in various programming languages locally or in Docker container',
    enabled: true,
    config: {
      dockerImage: 'unified-dev-env:latest',
      supportedLanguages: ['python', 'csharp', 'nodejs'],
      timeoutSeconds: 300
    }
  }
};
