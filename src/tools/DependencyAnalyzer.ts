import { exec } from 'child_process';
    export class DependencyAnalyzer {
      async analyze(workingDir: string): Promise<DependencyAnalysis> {
        const language = await this.detectLanguage(workingDir);
        const deps = await this.getDependencies(workingDir, language);
        const vulns = await this.checkVulnerabilities(deps, language);
        
        return {
          dependencies: deps,
          hasVulnerabilities: vulns.length > 0,
          vulnerabilities: vulns,
          outdatedPackages: await this.checkOutdated(workingDir, language)
        };
      }
    }
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export class DependencyAnalyzer {
  async analyze(workingDir: string): Promise<DependencyAnalysis> {
    const language = await this.detectLanguage(workingDir);
    const deps = await this.getDependencies(workingDir, language);
    const vulns = await this.checkVulnerabilities(deps, language);
    
    return {
      dependencies: deps,
      hasVulnerabilities: vulns.length > 0,
      vulnerabilities: vulns,
      outdatedPackages: await this.checkOutdated(workingDir, language)
    };
  }

  private async detectLanguage(dir: string): Promise<string> {
    const files = await fs.readdir(dir);
    if (files.includes('package.json')) return 'nodejs';
    if (files.includes('requirements.txt')) return 'python';
    if (files.some(f => f.endsWith('.csproj'))) return 'csharp';
    throw new Error('Unable to detect project language');
  }

  private async getDependencies(dir: string, language: string): Promise<Dependency[]> {
    // Implementation varies by language
    return [];
  }

  private async checkVulnerabilities(deps: Dependency[], language: string): Promise<Vulnerability[]> {
    // Implementation varies by language
    return [];
  }

  private async checkOutdated(dir: string, language: string): Promise<OutdatedPackage[]> {
    // Implementation varies by language
    return [];
  }
}

interface Dependency {
  name: string;
  version: string;
  type: 'direct' | 'transitive';
}

interface Vulnerability {
  package: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  fixedIn?: string;
}

interface OutdatedPackage {
  name: string;
  current: string;
  latest: string;
  type: 'major' | 'minor' | 'patch';
}

interface DependencyAnalysis {
  dependencies: Dependency[];
  hasVulnerabilities: boolean;
  vulnerabilities: Vulnerability[];
  outdatedPackages: OutdatedPackage[];
}
