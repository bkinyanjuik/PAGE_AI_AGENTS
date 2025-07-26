import Docker from 'dockerode';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NotificationService } from './notificationService';
import { MemoryService } from './memoryService';

interface TestEnvironment {
  id: string;
  agentId: string;
  status: 'creating' | 'running' | 'completed' | 'failed';
  containerId?: string;
  logs: string[];
  startTime: Date;
  endTime?: Date;
  results?: {
    success: boolean;
    buildTime: number;
    testsPassed: number;
    testsFailed: number;
    coverage?: number;
  };
}

export class DockerTestService {
  private static instance: DockerTestService;
  private docker: Docker;
  private environments: Map<string, TestEnvironment>;
  private notificationService: NotificationService;
  private memoryService: MemoryService;

  private constructor() {
    this.docker = new Docker();
    this.environments = new Map();
    this.notificationService = NotificationService.getInstance();
    this.memoryService = MemoryService.getInstance();
  }

  static getInstance(): DockerTestService {
    if (!DockerTestService.instance) {
      DockerTestService.instance = new DockerTestService();
    }
    return DockerTestService.instance;
  }

  async createTestEnvironment(
    agentId: string,
    dockerfile: string,
    composefile: string
  ): Promise<string> {
    const envId = uuidv4();
    const environment: TestEnvironment = {
      id: envId,
      agentId,
      status: 'creating',
      logs: [],
      startTime: new Date()
    };

    this.environments.set(envId, environment);

    try {
      // Create temporary directory for test environment
      const testDir = path.join(process.cwd(), 'test-envs', envId);
      await fs.mkdir(testDir, { recursive: true });

      // Write Dockerfile and docker-compose.yml
      await fs.writeFile(path.join(testDir, 'Dockerfile'), dockerfile);
      await fs.writeFile(path.join(testDir, 'docker-compose.yml'), composefile);

      // Update environment status
      environment.status = 'running';
      this.environments.set(envId, environment);

      return envId;
    } catch (error) {
      environment.status = 'failed';
      this.environments.set(envId, environment);
      throw error;
    }
  }

  async runTests(envId: string): Promise<void> {
    const environment = this.environments.get(envId);
    if (!environment) throw new Error('Environment not found');

    try {
      // Build and start containers
      const compose = await this.docker.createContainer({
        Image: 'docker/compose:1.29.2',
        Cmd: ['up', '--build'],
        WorkingDir: `/app`,
        HostConfig: {
          Binds: [`${path.join(process.cwd(), 'test-envs', envId)}:/app`]
        }
      });

      environment.containerId = compose.id;
      await compose.start();

      // Stream logs
      const logStream = await compose.logs({
        follow: true,
        stdout: true,
        stderr: true
      });

      logStream.on('data', (chunk) => {
        const log = chunk.toString();
        environment.logs.push(log);
        this.notifyLogUpdate(environment, log);
      });

      // Wait for container to finish
      const result = await compose.wait();
      
      environment.status = result.StatusCode === 0 ? 'completed' : 'failed';
      environment.endTime = new Date();
      environment.results = await this.parseTestResults(environment.logs);

      // Store test results in memory
      await this.storeTestResults(environment);

      // Clean up
      await this.cleanup(envId);
    } catch (error) {
      environment.status = 'failed';
      environment.logs.push(`Error: ${error.message}`);
      this.environments.set(envId, environment);
      throw error;
    }
  }

  private async parseTestResults(logs: string[]): Promise<TestEnvironment['results']> {
    // Implement test output parsing logic
    const testResults = {
      success: logs.some(log => log.includes('All tests passed')),
      buildTime: 0,
      testsPassed: 0,
      testsFailed: 0
    };

    // Parse build time
    const buildStart = logs.findIndex(log => log.includes('Building'));
    const buildEnd = logs.findIndex(log => log.includes('Successfully built'));
    if (buildStart >= 0 && buildEnd >= 0) {
      testResults.buildTime = buildEnd - buildStart;
    }

    // Parse test results
    testResults.testsPassed = logs.filter(log => 
      log.includes('PASS')
    ).length;
    testResults.testsFailed = logs.filter(log => 
      log.includes('FAIL')
    ).length;

    return testResults;
  }

  private async storeTestResults(environment: TestEnvironment): Promise<void> {
    await this.memoryService.storeMemory(
      JSON.stringify(environment),
      'test',
      {
        agentId: environment.agentId,
        tags: ['test_results', environment.status],
        metrics: {
          buildTime: environment.results?.buildTime,
          testsPassed: environment.results?.testsPassed,
          testsFailed: environment.results?.testsFailed
        }
      }
    );
  }

  private async notifyLogUpdate(environment: TestEnvironment, log: string): Promise<void> {
    await this.notificationService.notify(
      {
        title: 'Test Environment Update',
        content: log,
        priority: 'low',
        metadata: {
          environmentId: environment.id,
          agentId: environment.agentId,
          status: environment.status
        }
      },
      { websocket: true }
    );
  }

  async getEnvironment(envId: string): Promise<TestEnvironment | undefined> {
    return this.environments.get(envId);
  }

  async cleanup(envId: string): Promise<void> {
    const environment = this.environments.get(envId);
    if (!environment) return;

    try {
      // Stop and remove container
      if (environment.containerId) {
        const container = this.docker.getContainer(environment.containerId);
        await container.stop();
        await container.remove();
      }

      // Remove test directory
      await fs.rm(path.join(process.cwd(), 'test-envs', envId), { 
        recursive: true,
        force: true 
      });

      // Update environment status
      environment.containerId = undefined;
      this.environments.set(envId, environment);
    } catch (error) {
      console.error(`Failed to cleanup environment ${envId}:`, error);
    }
  }

  async getTestHistory(
    agentId: string,
    limit: number = 10
  ): Promise<TestEnvironment[]> {
    const results = await this.memoryService.searchMemory('', {
      filter: {
        type: ['test'],
        agentId,
        tags: ['test_results']
      },
      limit
    });

    return results.map(result => 
      JSON.parse(result.metadata.content)
    ).sort((a, b) => 
      b.startTime.getTime() - a.startTime.getTime()
    );
  }
}

