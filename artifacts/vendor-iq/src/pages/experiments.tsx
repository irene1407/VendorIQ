import { useListExperiments, useGetExperiment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TestTube, Play, SquareTerminal } from "lucide-react";
import { useState } from "react";

export default function Experiments() {
  const { data: experiments, isLoading: isListLoading } = useListExperiments();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeId = selectedId || (experiments && experiments.length > 0 ? experiments[0].id : null);
  const { data: detail, isLoading: isDetailLoading } = useGetExperiment(activeId as string, { query: { enabled: !!activeId } });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Experiment Tracker</h1>
        <p className="text-muted-foreground">Manage ML model training runs, hyperparameters, and evaluation metrics.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-border/10 flex flex-col h-[700px]">
          <CardHeader className="border-b border-border/10 pb-3">
            <CardTitle className="flex items-center gap-2"><TestTube className="h-5 w-5 text-primary" /> Training Runs</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experiment</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">F1 Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isListLoading ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
                ) : (
                  experiments?.map(exp => (
                    <TableRow 
                      key={exp.id} 
                      onClick={() => setSelectedId(exp.id)}
                      className={`cursor-pointer ${activeId === exp.id ? 'bg-primary/10' : ''}`}
                    >
                      <TableCell className="font-medium text-xs font-mono">{exp.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{exp.model}</TableCell>
                      <TableCell>
                        <Badge variant={exp.status === 'running' ? 'default' : exp.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {exp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{exp.metrics.f1Score?.toFixed(4) || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border/10">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-mono text-lg">{detail?.name || 'Select run'}</CardTitle>
                  <CardDescription>Model: {detail?.model}</CardDescription>
                </div>
                {detail?.status && (
                  <Badge variant={detail.status === 'running' ? 'default' : 'outline'} className="animate-pulse">
                    {detail.status.toUpperCase()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded border border-border/10 mb-6">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Accuracy</div>
                  <div className="font-mono font-medium">{detail?.metrics.accuracy?.toFixed(4) || '-'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">F1 Score</div>
                  <div className="font-mono font-medium text-primary">{detail?.metrics.f1Score?.toFixed(4) || '-'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Val Loss</div>
                  <div className="font-mono font-medium">{detail?.metricHistory?.[detail.metricHistory.length-1]?.valLoss.toFixed(4) || '-'}</div>
                </div>
              </div>

              <h3 className="text-sm font-semibold mb-4">Training Curves</h3>
              {isDetailLoading ? (
                <div className="h-[250px] bg-muted/20 animate-pulse rounded" />
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detail?.metricHistory} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="step" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="trainLoss" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} name="Train Loss" />
                      <Line type="monotone" dataKey="valLoss" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Val Loss" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><SquareTerminal className="h-4 w-4 text-muted-foreground" /> Hyperparameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0a0a0a] rounded-md p-4 overflow-auto border border-border/20">
                <pre className="text-xs font-mono text-emerald-400">
                  {detail?.hyperparams ? JSON.stringify(detail.hyperparams, null, 2) : '// No params'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
