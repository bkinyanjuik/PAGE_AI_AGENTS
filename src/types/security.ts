export interface SecurityScanResult {
  issues: SecurityIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scanTime: Date;
}

export interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'dependency' | 'secret' | 'vulnerability' | 'container';
  title: string;
  description: string;
  location?: {
    file: string;
    line?: number;
  };
  recommendation?: string;
  cwe?: string;
  cvss?: number;
}
