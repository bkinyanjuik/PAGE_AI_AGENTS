import { AgentFactory } from './factories/agentFactory';

export async function register() {
  console.log("Registering instrumentation, initializing agents...");
  await AgentFactory.initializeFullWorkforce();
  console.log("Agents initialized.");
}
