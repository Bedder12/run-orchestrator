import { StepStatus, WorkflowStep } from '@/types/run';
import { cn } from '@/lib/utils';
import { Check, Circle, Loader2, X, Clock } from 'lucide-react';

interface WorkflowTimelineProps {
  steps: StepStatus[];
  currentStep: WorkflowStep;
}

const stepLabels: Record<WorkflowStep, string> = {
  INIT: 'Initialize',
  SPEC: 'Specification',
  PLAN: 'Planning',
  APP_CODE: 'App Code',
  TESTS: 'Tests',
  SECURITY: 'Security',
  INFRA: 'Infrastructure',
  DEPLOY: 'Deploy',
};

export function WorkflowTimeline({ steps, currentStep }: WorkflowTimelineProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-foreground mb-4">Workflow</h3>
      <div className="relative">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCurrent = step.step === currentStep;
          
          return (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[11px] top-6 w-0.5 h-8',
                    step.status === 'completed' ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
              
              <div
                className={cn(
                  'flex items-center gap-3 p-2 rounded-md transition-colors',
                  isCurrent && 'bg-muted'
                )}
              >
                {/* Status Icon */}
                <div className="shrink-0">
                  <StepIcon status={step.status} />
                </div>
                
                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.status === 'completed' && 'text-success',
                      step.status === 'running' && 'text-primary',
                      step.status === 'failed' && 'text-destructive',
                      step.status === 'pending' && 'text-muted-foreground'
                    )}
                  >
                    {stepLabels[step.step]}
                  </p>
                  {step.duration && step.status === 'completed' && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(step.duration)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepIcon({ status }: { status: StepStatus['status'] }) {
  const baseClasses = 'h-6 w-6 rounded-full flex items-center justify-center';
  
  switch (status) {
    case 'completed':
      return (
        <div className={cn(baseClasses, 'bg-success/20')}>
          <Check className="h-3.5 w-3.5 text-success" />
        </div>
      );
    case 'running':
      return (
        <div className={cn(baseClasses, 'bg-primary/20')}>
          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
        </div>
      );
    case 'failed':
      return (
        <div className={cn(baseClasses, 'bg-destructive/20')}>
          <X className="h-3.5 w-3.5 text-destructive" />
        </div>
      );
    default:
      return (
        <div className={cn(baseClasses, 'bg-muted')}>
          <Circle className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      );
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
