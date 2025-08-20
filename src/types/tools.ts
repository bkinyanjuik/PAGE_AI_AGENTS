export interface CodeExecutionParams {
  command: string;
  useDocker?: boolean;
  workingDir?: string;
  language: 'python' | 'csharp' | 'nodejs';
  debug?: boolean;
  environmentVars?: Record<string, string>;
}

export interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  qualityMetrics?: CodeQualityMetrics;
  testResults?: TestResult;
  securityScan?: SecurityScanResult;
}

export interface DebuggerConfig {
  port: number;
  breakpoints: Array<{
    file: string;
    line: number;
    condition?: string;
  }>;
  watchExpressions?: string[];
}

export interface TestResult {
  success: boolean;
  coverage?: number;
  results?: {
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
    suites: TestSuite[];
  };
  error?: string;
}

export interface TestSuite {
  name: string;
  passed: number;
  failed: number;
  duration: number;
  tests: TestCase[];
}

export interface TestCase {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface CodeQualityMetrics {
  complexity: {
    cyclomatic: number;
    cognitive: number;
  };
  maintainability: {
    index: number;
    rating: 'A' | 'B' | 'C' | 'D' | 'F';
  };
  duplication: {
    percentage: number;
    locations: Array<{
      file: string;
      lines: [number, number];
    }>;
  };
  coverage: {
    lines: number;
    functions: number;
    branches: number;
  };
}

export interface ToolConfig {
  name: string;
  description: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}
