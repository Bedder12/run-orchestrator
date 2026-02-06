import { AppLayout } from '@/components/layout/AppLayout';
import { RunCard } from '@/components/RunCard';
import { Button } from '@/components/ui/button';
import { mockRuns } from '@/lib/mock-data';
import { Plus, Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = {
    total: mockRuns.length,
    running: mockRuns.filter(r => r.status === 'running').length,
    completed: mockRuns.filter(r => r.status === 'completed').length,
    failed: mockRuns.filter(r => r.status === 'failed').length,
    waiting: mockRuns.filter(r => r.status === 'waiting').length,
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Runs</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Monitor and manage your software delivery pipelines
            </p>
          </div>
          <Button asChild className="glow-primary">
            <Link to="/new">
              <Plus className="h-4 w-4 mr-2" />
              New Run
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total" value={stats.total} icon={Activity} />
          <StatCard label="Running" value={stats.running} icon={Clock} variant="primary" />
          <StatCard label="Waiting" value={stats.waiting} icon={Clock} variant="warning" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} variant="success" />
          <StatCard label="Failed" value={stats.failed} icon={XCircle} variant="destructive" />
        </div>

        {/* Runs List */}
        <div className="space-y-3">
          {mockRuns.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </div>

        {mockRuns.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No runs yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start your first automated software delivery
            </p>
            <Button asChild>
              <Link to="/new">
                <Plus className="h-4 w-4 mr-2" />
                New Run
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'primary' | 'success' | 'destructive' | 'warning';
}

function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-success',
    destructive: 'text-destructive',
    warning: 'text-warning',
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-4 w-4 ${variantClasses[variant]}`} />
      </div>
      <p className={`text-2xl font-bold ${variantClasses[variant]}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default Dashboard;
