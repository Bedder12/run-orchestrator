import { Run, WorkflowStep, StepStatus } from '@/types/run';

const createSteps = (currentStep: WorkflowStep, status: 'running' | 'completed' | 'failed' | 'waiting'): StepStatus[] => {
  const steps: WorkflowStep[] = ['INIT', 'SPEC', 'PLAN', 'APP_CODE', 'TESTS', 'SECURITY', 'INFRA', 'DEPLOY'];
  const currentIndex = steps.indexOf(currentStep);
  
  return steps.map((step, index) => {
    if (index < currentIndex) {
      return { step, status: 'completed', duration: Math.floor(Math.random() * 120) + 30 };
    } else if (index === currentIndex) {
      return { step, status: status === 'completed' ? 'completed' : status === 'failed' ? 'failed' : status === 'waiting' ? 'completed' : 'running' };
    }
    return { step, status: 'pending' };
  });
};

export const mockRuns: Run[] = [
  {
    id: 'run-001',
    name: 'E-commerce API',
    request: 'Build a REST API for an e-commerce platform with user authentication, product catalog, and order management.',
    status: 'running',
    currentStep: 'TESTS',
    steps: createSteps('TESTS', 'running'),
    validation: {
      tests: { passed: 47, failed: 3, coverage: 78 },
      security: { high: 0, medium: 2, low: 5 },
      performance: { latency: 145 }
    },
    decisions: [
      { id: 'd1', title: 'Using PostgreSQL for database', reason: 'Best fit for relational data with complex queries', timestamp: '2025-02-06T10:30:00Z' },
      { id: 'd2', title: 'JWT for authentication', reason: 'Stateless auth suitable for API scalability', timestamp: '2025-02-06T10:32:00Z' },
      { id: 'd3', title: 'Redis for session caching', reason: 'Improved performance for frequent auth checks', timestamp: '2025-02-06T10:35:00Z' }
    ],
    artifacts: [
      { id: 'a1', name: 'api-spec.yaml', type: 'spec', content: 'openapi: 3.0.0\ninfo:\n  title: E-commerce API\n  version: 1.0.0', generatedBy: 'SPEC', validationStatus: 'valid' },
      { id: 'a2', name: 'src/auth/controller.ts', type: 'code', content: 'export class AuthController {\n  async login(req, res) {\n    // JWT logic\n  }\n}', generatedBy: 'APP_CODE', validationStatus: 'valid' }
    ],
    deployment: {
      ready: false,
      checks: { testsPass: false, securityClean: true, infraValid: false }
    },
    waitingForApproval: false,
    createdAt: '2025-02-06T10:25:00Z',
    updatedAt: '2025-02-06T10:45:00Z'
  },
  {
    id: 'run-002',
    name: 'Analytics Dashboard',
    request: 'Create a real-time analytics dashboard with charts and data visualization.',
    status: 'waiting',
    currentStep: 'SECURITY',
    steps: createSteps('SECURITY', 'waiting'),
    validation: {
      tests: { passed: 32, failed: 0, coverage: 85 },
      security: { high: 1, medium: 0, low: 2 },
      performance: { latency: 89 }
    },
    decisions: [
      { id: 'd1', title: 'React with D3.js for charts', reason: 'Flexible visualization with good performance', timestamp: '2025-02-06T09:15:00Z' }
    ],
    artifacts: [],
    deployment: {
      ready: false,
      checks: { testsPass: true, securityClean: false, infraValid: true }
    },
    waitingForApproval: true,
    approvalSummary: 'Security scan found 1 high severity issue in authentication flow. Review required before proceeding.',
    createdAt: '2025-02-06T09:00:00Z',
    updatedAt: '2025-02-06T09:30:00Z'
  },
  {
    id: 'run-003',
    name: 'Payment Gateway',
    request: 'Integrate Stripe payment processing with webhook handling.',
    status: 'completed',
    currentStep: 'DEPLOY',
    steps: createSteps('DEPLOY', 'completed'),
    validation: {
      tests: { passed: 56, failed: 0, coverage: 92 },
      security: { high: 0, medium: 0, low: 1 },
      performance: { latency: 67 }
    },
    decisions: [
      { id: 'd1', title: 'Stripe SDK v3', reason: 'Latest version with improved error handling', timestamp: '2025-02-05T14:00:00Z' }
    ],
    artifacts: [],
    deployment: {
      ready: true,
      checks: { testsPass: true, securityClean: true, infraValid: true },
      deployedUrl: 'https://payment-api.staging.example.com',
      environment: 'staging'
    },
    waitingForApproval: false,
    createdAt: '2025-02-05T13:00:00Z',
    updatedAt: '2025-02-05T15:30:00Z'
  },
  {
    id: 'run-004',
    name: 'User Service',
    request: 'Build a microservice for user management with RBAC.',
    status: 'failed',
    currentStep: 'TESTS',
    steps: createSteps('TESTS', 'failed'),
    validation: {
      tests: { passed: 18, failed: 12, coverage: 45 },
      security: { high: 0, medium: 1, low: 0 },
      performance: {}
    },
    decisions: [],
    artifacts: [],
    deployment: {
      ready: false,
      checks: { testsPass: false, securityClean: true, infraValid: false }
    },
    waitingForApproval: false,
    createdAt: '2025-02-06T08:00:00Z',
    updatedAt: '2025-02-06T08:45:00Z'
  }
];

export const getRunById = (id: string): Run | undefined => {
  return mockRuns.find(run => run.id === id);
};
