export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'waiting';

export type WorkflowStep = 
  | 'INIT'
  | 'SPEC'
  | 'PLAN'
  | 'APP_CODE'
  | 'TESTS'
  | 'SECURITY'
  | 'INFRA'
  | 'DEPLOY';

export interface StepStatus {
  step: WorkflowStep;
  status: RunStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number; // in seconds
}

export interface ValidationMetrics {
  tests: {
    passed: number;
    failed: number;
    coverage: number;
  };
  security: {
    high: number;
    medium: number;
    low: number;
  };
  performance: {
    latency?: number;
  };
}

export interface Decision {
  id: string;
  title: string;
  reason: string;
  timestamp: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'spec' | 'code' | 'test' | 'infra';
  content: string;
  generatedBy: WorkflowStep;
  validationStatus: 'pending' | 'valid' | 'invalid';
  previousVersion?: string;
}

export interface DeploymentInfo {
  ready: boolean;
  checks: {
    testsPass: boolean;
    securityClean: boolean;
    infraValid: boolean;
  };
  deployedUrl?: string;
  environment?: 'staging' | 'production';
}

export interface Run {
  id: string;
  name: string;
  request: string;
  status: RunStatus;
  currentStep: WorkflowStep;
  steps: StepStatus[];
  validation: ValidationMetrics;
  decisions: Decision[];
  artifacts: Artifact[];
  deployment: DeploymentInfo;
  waitingForApproval: boolean;
  approvalSummary?: string;
  createdAt: string;
  updatedAt: string;
}
