import { useListDriftMetrics, useGetModelMetrics, useGetPredictionVolume } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Activity, ServerCrash, Cpu } from "lucide-react";

export default function Monitoring() {
  const { data: metricsArray, isLoading: isMetricsLoading, isError: isMetricsError } = useGetModelMetrics();
  const { data: drift, isLoading: isDriftLoading } = useListDriftMetrics();
  const { data: volume, isLoading: isVolumeLoading } = useGetPredictionVolume({ days: 7 });

  // Aggregate per-model array into summary values
  const models = Array.isArray(metricsArray) ? metricsArray : [];
  const hasMetrics = !isMetricsError && models.length > 0;
  const overallStatus = !hasMetrics ? 'unknown' : models.some(m => m.status === 'degraded' || m.status === 'unhealthy') ? 'degraded' : 'healthy';
  const maxP99 = hasMetrics ? Math.max(...models.map(m => m.p99LatencyMs ?? 0)) : null;
  const totalPredictions = hasMetrics ? models.reduce((sum, m) => sum + (m.predictionsToday ?? 0), 0) : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Model Health & Monitoring</h1>
        <p className="text-muted-foreground">Production ML system metrics, drift detection, and latency tracking.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? <div className="h-8 bg-muted/20 animate-pulse rounded" /> : (
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded-full ${overallStatus === 'healthy' ? 'bg-emerald-500' : overallStatus === 'unknown' ? 'bg-muted-foreground' : 'bg-destructive'} shadow-[0_0_10px_currentColor]`} />
                <span className="text-2xl font-display font-bold capitalize">{overallStatus}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">P99 Latency (worst)</CardTitle>
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? <div className="h-8 bg-muted/20 animate-pulse rounded" /> : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-foreground">{maxP99 ?? '—'}</span>
                {maxP99 != null && <span className="text-sm font-mono text-muted-foreground">ms</span>}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inference Volume (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? <div className="h-8 bg-muted/20 animate-pulse rounded" /> : (
              <div className="text-3xl font-display font-bold">{totalPredictions != null ? totalPredictions.toLocaleString() : '—'}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-border/10 h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5 text-primary" /> Prediction Volume by Model</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {isVolumeLoading ? <div className="h-full w-full bg-muted/20 animate-pulse rounded" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volume} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="risk" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="forecast" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="fraud" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10 overflow-hidden flex flex-col h-[400px]">
          <CardHeader className="border-b border-border/10">
            <CardTitle className="flex items-center gap-2"><ServerCrash className="h-5 w-5 text-destructive" /> Drift Detection</CardTitle>
            <CardDescription>Feature and prediction distribution drift</CardDescription>
          </CardHeader>
          <div className="flex-1 overflow-auto">
            {isDriftLoading ? (
              <div className="p-4 space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-muted/20 animate-pulse rounded" />)}
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {drift?.map((d, i) => (
                  <div key={i} className="p-4 hover:bg-muted/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-sm">{d.model}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{d.metricName}</div>
                      </div>
                      <Badge variant={d.status === 'critical' ? 'destructive' : d.status === 'warning' ? 'warning' : 'success'} className="text-[10px]">
                        {d.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Baseline:</span>
                        <span className="font-mono">{d.baselineValue.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Current:</span>
                        <span className={`font-mono font-bold ${d.status !== 'normal' ? 'text-destructive' : ''}`}>{d.currentValue.toFixed(4)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">Score: </span>
                        <span className="font-mono text-primary">{d.driftScore.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
