import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCreateRun } from '@/hooks/use-runs';
import { ChevronDown, Send, Settings, Cloud, Code2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const NewRun = () => {
  const navigate = useNavigate();
  const [request, setRequest] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const createRun = useCreateRun();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;

    try {
      const run = await createRun.mutateAsync(request);
      navigate(`/runs/${run.id}`);
    } catch (error) {
      // Error is handled by mutation state
      console.error('Failed to create run:', error);
    }
  };

  const canSubmit = request.trim().length > 10 && !createRun.isPending;

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto animate-slide-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">New Run</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Describe the software you want to build
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {createRun.isError && (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Failed to start run</p>
                <p className="text-xs text-muted-foreground">
                  {createRun.error?.message || 'Please try again'}
                </p>
              </div>
            </div>
          )}

          {/* Main Request Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What do you want to build?
            </label>
            <Textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="Describe your software requirements in natural language. Be specific about functionality, APIs, data models, and any integrations needed..."
              className="min-h-[200px] resize-none bg-card border-border focus:border-primary text-foreground placeholder:text-muted-foreground font-mono text-sm"
              disabled={createRun.isPending}
            />
            <p className="text-xs text-muted-foreground">
              {request.length} characters · Minimum 10 required
            </p>
          </div>

          {/* Advanced Settings (Collapsed) */}
          <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Settings
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isSettingsOpen && 'rotate-180'
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid gap-4 p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Tech Stack</p>
                      <p className="text-xs text-muted-foreground">Determined by backend</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    TypeScript · Node.js
                  </span>
                </div>
                
                <div className="border-t border-border my-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Cloud Provider</p>
                      <p className="text-xs text-muted-foreground">Determined by backend</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    AWS
                  </span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="min-w-[140px] glow-primary"
            >
              {createRun.isPending ? (
                <>
                  <span className="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Start Run
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-12 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="text-sm font-medium text-foreground mb-3">Tips for better results</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Be specific about API endpoints, data models, and business logic
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Mention any required integrations (databases, third-party APIs)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Specify authentication and authorization requirements
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default NewRun;
