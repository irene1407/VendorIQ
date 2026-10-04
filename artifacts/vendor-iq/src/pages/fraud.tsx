import { useMemo } from "react";
import {
  useListFraudAlerts,
  useGetFraudStats,
  FraudAlertType,
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  ShieldAlert,
  Search,
  Filter,
  Shield,
} from "lucide-react";

export default function Fraud() {
  const {
    data: alertsResponse,
    isLoading: isAlertsLoading,
  } = useListFraudAlerts({ status: "open" });

  const alerts = Array.isArray(alertsResponse)
    ? alertsResponse
    : [];

  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useGetFraudStats();

  const severityBreakdown = useMemo(() => {
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const alert of alerts) {
      const severity = alert.severity as keyof typeof counts;

      if (severity in counts) {
        counts[severity] += 1;
      }
    }

    return [
      {
        type: "Critical",
        count: counts.critical,
      },
      {
        type: "High",
        count: counts.high,
      },
      {
        type: "Medium",
        count: counts.medium,
      },
      {
        type: "Low",
        count: counts.low,
      },
    ].filter((item) => item.count > 0);
  }, [alerts]);

  const COLORS = [
    "#EF4444",
    "#F59E0B",
    "#3B82F6",
    "#22C55E",
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      default:
        return "default";
    }
  };

  const formatFraudType = (type: string) => {
    return type
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Fraud Detection
        </h1>

        <p className="text-muted-foreground">
          Machine-learning anomaly detection across supplier behavior and risk patterns.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Anomalies
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isStatsLoading ? (
              <div className="h-8 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-display font-bold">
                {stats?.totalAlerts ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Open Anomalies
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isStatsLoading ? (
              <div className="h-8 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-display font-bold text-destructive">
                {stats?.openAlerts ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Anomaly Rate
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isStatsLoading ? (
              <div className="h-8 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-display font-bold">
                {((stats?.detectionRate ?? 0) * 100).toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Resolved
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isStatsLoading ? (
              <div className="h-8 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-display font-bold">
                {stats?.resolvedAlerts ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-card/50 backdrop-blur border-border/10 flex flex-col h-[600px]">
          <CardHeader className="border-b border-border/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Investigation Queue
              </CardTitle>

              <CardDescription>
                Active vendor anomalies requiring human review
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-auto">
            {isAlertsLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-24 bg-muted/20 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Shield className="h-12 w-12 mb-4 opacity-20" />

                <p>
                  No active vendor anomalies detected.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-6 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            getSeverityColor(
                              alert.severity,
                            ) as any
                          }
                          className="uppercase text-[10px]"
                        >
                          {alert.severity}
                        </Badge>

                        <span className="font-semibold">
                          {alert.supplierName}
                        </span>

                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />

                          {formatFraudType(
                            alert.type,
                          )}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground font-mono">
                        ID: {alert.id}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/80 my-3 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                        Anomaly Score:{" "}
                        <span className="font-mono text-primary font-bold">
                          {alert.anomalyScore?.toFixed(2) ??
                            "N/A"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Review Evidence
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
            <CardTitle>
              Anomaly Severity
            </CardTitle>

            <CardDescription>
              Breakdown of detected vendor anomalies
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center p-4">
            {isAlertsLoading ? (
              <div className="h-64 w-64 rounded-full bg-muted/20 animate-pulse my-8" />
            ) : severityBreakdown.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No anomaly data available.
              </div>
            ) : (
              <>
                <div
                  style={{
                    width: "100%",
                    height: 260,
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <PieChart>
                      <Pie
                        data={severityBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="type"
                        stroke="none"
                        isAnimationActive={false}
                      >
                        {severityBreakdown.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${entry.type}`}
                              fill={
                                COLORS[
                                  index %
                                    COLORS.length
                                ]
                              }
                            />
                          ),
                        )}
                      </Pie>

                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor:
                            "hsl(var(--card))",
                          borderColor:
                            "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(
                          value: number,
                          name: string,
                        ) => [
                          value,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 w-full">
                  {severityBreakdown.map(
                    (entry, index) => (
                      <div
                        key={entry.type}
                        className="flex items-center gap-2 text-xs text-foreground"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            background:
                              COLORS[
                                index %
                                  COLORS.length
                              ],
                          }}
                        />

                        <span className="truncate">
                          {entry.type}
                        </span>

                        <span className="ml-auto font-mono text-muted-foreground">
                          {entry.count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}