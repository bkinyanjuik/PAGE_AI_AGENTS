import simpleGit, { SimpleGit } from 'simple-git';
import { FileOperations } from './FileOperations';

export interface GitOperation {
  clone(repo: string, directory: string): Promise<void>;
  commit(message: string, files: string[]): Promise<void>;
  push(branch: string): Promise<void>;
  createPullRequest(title: string, description: string): Promise<void>;
}

export class GitOperations implements GitOperation {
  private git: SimpleGit;
  private fileOps: FileOperations;

  constructor(workingDirectory: string) {
    this.git = simpleGit(workingDirectory);
    this.fileOps = new FileOperations(workingDirectory);
  }

  async clone(repo: string, directory: string): Promise<void> {
    await this.git.clone(repo, directory);
  }

  async commit(message: string, files: string[]): Promise<void> {
    await this.git.add(files);
    await this.git.commit(message);
  }

  async push(branch: string): Promise<void> {
    await this.git.push('origin', branch);
  }

  async createPullRequest(title: string, description: string): Promise<void> {
    // Implementation would depend on the Git provider's API (GitHub, GitLab, etc.)
    throw new Error("Implement based on specific Git provider");
  }

  async getCurrentBranch(): Promise<string> {
    const result = await this.git.branch();
    return result.current;
  }

  async createBranch(branchName: string): Promise<void> {
    await this.git.checkoutLocalBranch(branchName);
  }
}
