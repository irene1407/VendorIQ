import { useListFraudAlerts, useGetFraudStats, useResolveFraudAlert, FraudAlertType } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { ShieldAlert, CheckCircle2, Search, Filter, Shield } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function Fraud() {
  const { data: alerts, isLoading: isAlertsLoading, refetch } = useListFraudAlerts({ status: 'open' });
  const { data: stats, isLoading: isStatsLoading } = useGetFraudStats();
  const resolveMutation = useResolveFraudAlert();

  const handleResolve = (id: string) => {
    resolveMutation.mutate(
      { id, data: { resolution: 'Investigated and cleared' } },
      {
        onSuccess: () => {
          toast.success("Fraud alert resolved successfully");
          refetch();
        },
        onError: () => {
          toast.error("Failed to resolve alert");
        }
      }
    );
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      default: return 'default';
    }
  };

  const formatFraudType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Fraud Detection</h1>
        <p className="text-muted-foreground">Anomaly detection across invoices, bids, and supplier patterns.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Prevented</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <div className="h-8 bg-muted/20 animate-pulse rounded" /> : (
              <div className="text-3xl font-display font-bold text-emerald-500">
                {formatCurrency(stats?.fraudPreventedAmount || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <div className="h-8 bg-muted/20 animate-pulse rounded" /> : (
              <div className="text-3xl font-display font-bold text-destructive">
                {stats?.openAlerts}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Detection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <div className="h-8 bg-muted/20 animate-pulse rounded" /> : (
              <div className="text-3xl font-display font-bold">
                {(stats?.detectionRate || 0) * 100}%
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? <div className="h-8 bg-muted/20 animate-pulse rounded" /> : (
              <div className="text-3xl font-display font-bold">
                {stats?.resolvedAlerts}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-card/50 backdrop-blur border-border/10 flex flex-col h-[600px]">
          <CardHeader className="border-b border-border/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Investigation Queue</CardTitle>
              <CardDescription>Active anomalies requiring human review</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Filter</Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-auto">
            {isAlertsLoading ? (
              <div className="p-4 space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-lg" />)}
              </div>
            ) : alerts?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Shield className="h-12 w-12 mb-4 opacity-20" />
                <p>No open fraud alerts. Network is secure.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {alerts?.map(alert => (
                  <div key={alert.id} className="p-6 hover:bg-muted/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={getSeverityColor(alert.severity) as any} className="uppercase text-[10px]">
                          {alert.severity}
                        </Badge>
                        <span className="font-semibold">{alert.supplierName}</span>
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          {formatFraudType(alert.type)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">ID: {alert.id.split('-')[1]}</span>
                    </div>
                    
                    <p className="text-sm text-foreground/80 my-3 leading-relaxed">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                        Anomaly Score: <span className="font-mono text-primary font-bold">{alert.anomalyScore?.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Review Evidence</Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolveMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10 h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Topology</CardTitle>
            <CardDescription>Breakdown of anomaly types</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            {isStatsLoading ? (
               <div className="h-64 w-64 rounded-full bg-muted/20 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.alertsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="type"
                    stroke="none"
                  >
                    {stats?.alertsByType?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => [value, formatFraudType(name)]}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-xs text-foreground">{formatFraudType(value)}</span>}
                    layout="vertical"
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
