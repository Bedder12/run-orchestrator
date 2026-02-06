import { RunStatus } from '@/types/run';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RunStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<RunStatus, { label: string; className: string; dotClassName: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground',
    dotClassName: 'bg-muted-foreground'
  },
  running: {
    label: 'Running',
    className: 'bg-primary/10 text-primary',
    dotClassName: 'bg-primary animate-pulse'
  },
  completed: {
    label: 'Completed',
    className: 'bg-success/10 text-success',
    dotClassName: 'bg-success'
  },
  failed: {
    label: 'Failed',
    className: 'bg-destructive/10 text-destructive',
    dotClassName: 'bg-destructive'
  },
  waiting: {
    label: 'Waiting',
    className: 'bg-warning/10 text-warning',
    dotClassName: 'bg-warning animate-pulse'
  }
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClassName)} />
      {config.label}
    </span>
  );
}
