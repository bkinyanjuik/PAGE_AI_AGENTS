import { AgentFactory } from './factories/agentFactory';

async function initialize() {
  console.log("Initializing agents...");
  await AgentFactory.initializeFullWorkforce();
  console.log("Agents initialized.");
}

initialize().catch(error => {
  console.error("Failed to initialize agents:", error);
});
