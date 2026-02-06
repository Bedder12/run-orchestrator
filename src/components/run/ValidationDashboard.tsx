import { ValidationMetrics } from '@/types/run';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Shield, Gauge, AlertTriangle } from 'lucide-react';

interface ValidationDashboardProps {
  validation: ValidationMetrics;
}

export function ValidationDashboard({ validation }: ValidationDashboardProps) {
  const { tests, security, performance } = validation;
  
  const testsPass = tests.failed === 0;
  const securityClean = security.high === 0;
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Validation</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Tests */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            {testsPass ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium">Tests</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Passed</span>
              <span className="text-success font-mono">{tests.passed}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Failed</span>
              <span className={cn('font-mono', tests.failed > 0 ? 'text-destructive' : 'text-muted-foreground')}>
                {tests.failed}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Coverage</span>
                <span className={cn(
                  'font-mono',
                  tests.coverage >= 80 ? 'text-success' : tests.coverage >= 60 ? 'text-warning' : 'text-destructive'
                )}>
                  {tests.coverage}%
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    tests.coverage >= 80 ? 'bg-success' : tests.coverage >= 60 ? 'bg-warning' : 'bg-destructive'
                  )}
                  style={{ width: `${tests.coverage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            {securityClean ? (
              <Shield className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <span className="text-sm font-medium">Security</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">High</span>
              <span className={cn('font-mono', security.high > 0 ? 'text-destructive' : 'text-muted-foreground')}>
                {security.high}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Medium</span>
              <span className={cn('font-mono', security.medium > 0 ? 'text-warning' : 'text-muted-foreground')}>
                {security.medium}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Low</span>
              <span className="font-mono text-muted-foreground">{security.low}</span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Latency</span>
              <span className={cn(
                'font-mono',
                performance.latency 
                  ? performance.latency < 100 ? 'text-success' : performance.latency < 200 ? 'text-warning' : 'text-destructive'
                  : 'text-muted-foreground'
              )}>
                {performance.latency ? `${performance.latency}ms` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
