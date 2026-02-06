import { Run } from '@/types/run';
import { StatusBadge } from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RunCardProps {
  run: Run;
}

export function RunCard({ run }: RunCardProps) {
  return (
    <Link
      to={`/runs/${run.id}`}
      className="group block p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-foreground truncate">{run.name}</h3>
            <StatusBadge status={run.status} size="sm" />
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
            {run.request}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono bg-muted px-2 py-0.5 rounded">
              {run.currentStep.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(run.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
      </div>
    </Link>
  );
}
