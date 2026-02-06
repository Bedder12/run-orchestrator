import { Decision } from '@/types/run';
import { formatDistanceToNow } from 'date-fns';
import { Lightbulb } from 'lucide-react';

interface DecisionLogProps {
  decisions: Decision[];
}

export function DecisionLog({ decisions }: DecisionLogProps) {
  if (decisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Lightbulb className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">No decisions recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decisions.map((decision, index) => (
        <div
          key={decision.id}
          className="p-4 rounded-lg border border-border bg-card animate-slide-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">{decision.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{decision.reason}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(decision.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
