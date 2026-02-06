import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ApprovalGateProps {
  summary: string;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export function ApprovalGate({ summary, onApprove, onReject, isLoading }: ApprovalGateProps) {
  return (
    <div className="border border-warning/50 rounded-lg bg-warning/5 overflow-hidden">
      <div className="p-4 border-b border-warning/30 bg-warning/10 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Approval Required</h3>
          <p className="text-xs text-muted-foreground">Review the summary below before proceeding</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="p-3 rounded bg-card border border-border mb-4">
          <p className="text-sm text-foreground">{summary}</p>
        </div>
        
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onReject}
            disabled={isLoading}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={onApprove}
            disabled={isLoading}
            className="glow-success bg-success hover:bg-success/90 text-success-foreground"
          >
            {isLoading ? (
              <span className="h-4 w-4 mr-2 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
