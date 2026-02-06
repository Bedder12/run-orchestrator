import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkflowTimeline } from '@/components/run/WorkflowTimeline';
import { ValidationDashboard } from '@/components/run/ValidationDashboard';
import { DecisionLog } from '@/components/run/DecisionLog';
import { ArtifactsViewer } from '@/components/run/ArtifactsViewer';
import { ApprovalGate } from '@/components/run/ApprovalGate';
import { DeploymentStatus } from '@/components/run/DeploymentStatus';
import { StatusBadge } from '@/components/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRun, useRunSubscription, useApproveRun, useRejectRun, useDeployRun } from '@/hooks/use-runs';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RunDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: run, isLoading, error } = useRun(id || '');
  useRunSubscription(id || '');
  
  const approveRun = useApproveRun();
  const rejectRun = useRejectRun();
  const deployRun = useDeployRun();

  const handleApprove = async () => {
    if (!id) return;
    await approveRun.mutateAsync(id);
  };

  const handleReject = async () => {
    if (!id) return;
    await rejectRun.mutateAsync(id);
  };

  const handleDeploy = async () => {
    if (!id) return;
    await deployRun.mutateAsync(id);
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="flex gap-6">
              <div className="w-56 h-96 bg-muted rounded" />
              <div className="flex-1 h-96 bg-muted rounded" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Failed to load run</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Link to="/" className="text-primary hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Not found state
  if (!run) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-foreground mb-2">Run not found</h2>
            <p className="text-muted-foreground mb-4">The requested run does not exist.</p>
            <Link to="/" className="text-primary hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto animate-slide-in">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{run.name}</h1>
                <StatusBadge status={run.status} />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                {run.request}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Updated {formatDistanceToNow(new Date(run.updatedAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Left Sidebar - Workflow */}
          <div className="w-56 shrink-0">
            <div className="sticky top-6">
              <WorkflowTimeline steps={run.steps} currentStep={run.currentStep} />
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Validation Dashboard */}
            <ValidationDashboard validation={run.validation} />

            {/* Approval Gate */}
            {run.waitingForApproval && run.approvalSummary && (
              <ApprovalGate
                summary={run.approvalSummary}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={approveRun.isPending}
              />
            )}

            {/* Tabs for Decision Log and Artifacts */}
            <Tabs defaultValue="decisions" className="w-full">
              <TabsList className="bg-muted/50 border border-border">
                <TabsTrigger value="decisions" className="data-[state=active]:bg-card">
                  Decisions
                  {run.decisions.length > 0 && (
                    <span className="ml-2 bg-muted px-1.5 py-0.5 rounded text-xs">
                      {run.decisions.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="artifacts" className="data-[state=active]:bg-card">
                  Artifacts
                  {run.artifacts.length > 0 && (
                    <span className="ml-2 bg-muted px-1.5 py-0.5 rounded text-xs">
                      {run.artifacts.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="decisions" className="mt-4">
                <DecisionLog decisions={run.decisions} />
              </TabsContent>
              
              <TabsContent value="artifacts" className="mt-4">
                <ArtifactsViewer artifacts={run.artifacts} />
              </TabsContent>
            </Tabs>

            {/* Deployment Status */}
            <DeploymentStatus
              deployment={run.deployment}
              onDeploy={handleDeploy}
              isDeploying={deployRun.isPending}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RunDetails;
