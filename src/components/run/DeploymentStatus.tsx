import { DeploymentInfo } from '@/types/run';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Rocket, ExternalLink } from 'lucide-react';

interface DeploymentStatusProps {
  deployment: DeploymentInfo;
  onDeploy: () => void;
  isDeploying?: boolean;
}

export function DeploymentStatus({ deployment, onDeploy, isDeploying }: DeploymentStatusProps) {
  const { ready, checks, deployedUrl, environment } = deployment;
  const allChecksPass = checks.testsPass && checks.securityClean && checks.infraValid;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          Deployment
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Checklist */}
        <div className="space-y-2">
          <CheckItem label="Tests passed" checked={checks.testsPass} />
          <CheckItem label="Security clean" checked={checks.securityClean} />
          <CheckItem label="Infrastructure valid" checked={checks.infraValid} />
        </div>

        {/* Deploy Button or Deployed Info */}
        {deployedUrl ? (
          <div className="p-3 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Deployed
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Environment: {environment}
                </p>
              </div>
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <span className="font-mono">{new URL(deployedUrl).hostname}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : (
          <Button
            onClick={onDeploy}
            disabled={!allChecksPass || isDeploying}
            className={cn(
              'w-full',
              allChecksPass && 'glow-primary'
            )}
          >
            {isDeploying ? (
              <>
                <span className="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy
              </>
            )}
          </Button>
        )}

        {!allChecksPass && !deployedUrl && (
          <p className="text-xs text-muted-foreground text-center">
            All checks must pass before deployment
          </p>
        )}
      </div>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {checked ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={cn(
        'text-sm',
        checked ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {label}
      </span>
    </div>
  );
}
