import { Octokit } from '@octokit/rest';
import { TaskResult } from '../types/agents';

export class GitHubService {
  private static instance: GitHubService;
  private octokit: Octokit;

  private constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }

  static getInstance(): GitHubService {
    if (!GitHubService.instance) {
      GitHubService.instance = new GitHubService();
    }
    return GitHubService.instance;
  }

  async createPullRequest(params: {
    owner: string;
    repo: string;
    title: string;
    body: string;
    head: string;
    base: string;
  }): Promise<number> {
    const response = await this.octokit.pulls.create(params);
    return response.data.number;
  }

  async commitFile(params: {
    owner: string;
    repo: string;
    path: string;
    message: string;
    content: string;
    branch: string;
  }): Promise<void> {
    const { owner, repo, path, message, content, branch } = params;

    // Get the current file (if it exists) to get its SHA
    let sha: string | undefined;
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });
      if (!Array.isArray(data)) {
        sha = data.sha;
      }
    } catch (error) {
      // File doesn't exist yet, which is fine
    }

    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      branch,
      sha
    });
  }

  async reviewPullRequest(params: {
    owner: string;
    repo: string;
    pull_number: number;
    event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
    body: string;
  }): Promise<void> {
    await this.octokit.pulls.createReview(params);
  }
}
