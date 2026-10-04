import {
  useListDriftMetrics,
  useGetModelMetrics,
  useGetPredictionVolume,
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Activity,
  ServerCrash,
  Cpu,
  ShieldCheck,
  BrainCircuit,
  LineChart,
  AlertTriangle,
} from "lucide-react";

const MODEL_INFO = [
  {
    id: "risk",
    name: "Vendor Risk ML",
    type: "Random Forest",
    purpose: "Supplier risk classification",
    icon: ShieldCheck,
  },
  {
    id: "forecast",
    name: "Commodity Forecast",
    type: "XGBoost Regressor",
    purpose: "Commodity price forecasting",
    icon: LineChart,
  },
  {
    id: "fraud",
    name: "Vendor Anomaly Detection",
    type: "Isolation Forest",
    purpose: "Unusual vendor behavior detection",
    icon: AlertTriangle,
  },
];

export default function Monitoring() {
  const {
    data: metricsArray,
    isLoading: isMetricsLoading,
    isError: isMetricsError,
  } = useGetModelMetrics();

  const {
    data: drift,
    isLoading: isDriftLoading,
  } = useListDriftMetrics();

  const {
    data: volume,
    isLoading: isVolumeLoading,
  } = useGetPredictionVolume({ days: 7 });

  const driftList = Array.isArray(drift) ? drift : [];
  const volumeList = Array.isArray(volume) ? volume : [];
  const models = Array.isArray(metricsArray) ? metricsArray : [];

  const hasMetrics =
    !isMetricsError && models.length > 0;

  const overallStatus = !hasMetrics
    ? "unknown"
    : models.some(
          (model) =>
            model.status === "degraded" ||
            model.status === "down",
        )
      ? "degraded"
      : "healthy";

  const maxP99 = hasMetrics
    ? Math.max(
        ...models.map(
          (model) => model.p99LatencyMs ?? 0,
        ),
      )
    : null;

  const totalPredictions = hasMetrics
    ? models.reduce(
        (sum, model) =>
          sum + (model.predictionsToday ?? 0),
        0,
      )
    : null;

  const criticalDriftCount = driftList.filter(
    (item) => item.status === "critical",
  ).length;

  const warningDriftCount = driftList.filter(
    (item) => item.status === "warning",
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Model Health & Monitoring
        </h1>

        <p className="text-muted-foreground">
          Production ML system metrics, drift detection,
          inference volume, and model health.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isMetricsLoading ? (
              <div className="h-8 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${
                    overallStatus === "healthy"
                      ? "bg-emerald-500"
                      : overallStatus === "unknown"
                        ? "bg-muted-foreground"
                        : "bg-destructive"
                  } shadow-[0_0_10px_currentColor]`}
                />

                <span className="text-2xl font-display font-bold capitalize">
                  {overallStatus}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              P99 Latency
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isMetricsLoading ? (
              <div className="h-8 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold">
                  {maxP99 ?? "—"}
                </span>

                {maxP99 != null && (
                  <span className="text-sm font-mono text-muted-foreground">
                    ms
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Predictions Today
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isMetricsLoading ? (
              <div className="h-8 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-display font-bold">
                {totalPredictions != null
                  ? totalPredictions.toLocaleString()
                  : "—"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drift Alerts
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isDriftLoading ? (
              <div className="h-8 bg-muted/20 animate-pulse rounded" />
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-display font-bold">
                  {criticalDriftCount +
                    warningDriftCount}
                </span>

                <span className="text-sm text-muted-foreground">
                  flagged
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Production ML Models
          </CardTitle>

          <CardDescription>
            Models currently powering VendorIQ intelligence.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {MODEL_INFO.map((model) => {
              const Icon = model.icon;

              const apiModel = models.find(
                (item) =>
                  String(item.model ?? "")
                    .toLowerCase()
                    .includes(model.id),
              );

              const modelStatus =
                apiModel?.status ?? "unknown";

              return (
                <div
                  key={model.id}
                  className="rounded-xl border border-border/10 bg-background/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>

                      <div>
                        <div className="font-semibold">
                          {model.name}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {model.type}
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={
                        modelStatus === "healthy"
                          ? "success"
                          : modelStatus === "unknown"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {modelStatus.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    {model.purpose}
                  </p>

                  {apiModel && (
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground">
                          P99 latency
                        </div>

                        <div className="font-mono font-semibold mt-1">
                          {apiModel.p99LatencyMs ?? "—"} ms
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">
                          Today
                        </div>

                        <div className="font-mono font-semibold mt-1">
                          {(
                            apiModel.predictionsToday ?? 0
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-border/10 h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Prediction Volume
            </CardTitle>

            <CardDescription>
              Seven-day inference activity across VendorIQ
              models.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1">
            {isVolumeLoading ? (
              <div className="h-full w-full bg-muted/20 animate-pulse rounded" />
            ) : volumeList.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No prediction volume data available.
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={volumeList}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    hide
                  />

                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `${value / 1000}k`
                        : value
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "hsl(var(--card))",
                      borderColor:
                        "hsl(var(--border))",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="risk"
                    stackId="1"
                    stroke="hsl(var(--destructive))"
                    fill="hsl(var(--destructive))"
                    fillOpacity={0.6}
                    name="Risk"
                  />

                  <Area
                    type="monotone"
                    dataKey="forecast"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Forecast"
                  />

                  <Area
                    type="monotone"
                    dataKey="fraud"
                    stackId="1"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                    fillOpacity={0.6}
                    name="Anomaly Detection"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10 overflow-hidden flex flex-col h-[400px]">
          <CardHeader className="border-b border-border/10">
            <CardTitle className="flex items-center gap-2">
              <ServerCrash className="h-5 w-5 text-destructive" />
              Drift Detection
            </CardTitle>

            <CardDescription>
              Feature and prediction distribution drift.
            </CardDescription>
          </CardHeader>

          <div className="flex-1 overflow-auto">
            {isDriftLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 bg-muted/20 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : driftList.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                No drift metrics are currently available.
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {driftList.map((item, index) => (
                  <div
                    key={`${item.model}-${item.metricName}-${index}`}
                    className="p-4 hover:bg-muted/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-sm">
                          {item.model}
                        </div>

                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {item.metricName}
                        </div>
                      </div>

                      <Badge
                        variant={
                          item.status === "critical"
                            ? "destructive"
                            : item.status === "warning"
                              ? "warning"
                              : "success"
                        }
                        className="text-[10px]"
                      >
                        {String(
                          item.status,
                        ).toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Baseline:
                        </span>

                        <span className="font-mono">
                          {Number(
                            item.baselineValue,
                          ).toFixed(4)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Current:
                        </span>

                        <span
                          className={`font-mono font-bold ${
                            item.status !== "normal"
                              ? "text-destructive"
                              : ""
                          }`}
                        >
                          {Number(
                            item.currentValue,
                          ).toFixed(4)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-muted-foreground">
                          Score:{" "}
                        </span>

                        <span className="font-mono text-primary">
                          {Number(
                            item.driftScore,
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Monitoring Notes
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-lg border border-border/10 p-3">
              <div className="font-semibold">
                Risk ML
              </div>

              <div className="text-muted-foreground mt-1">
                Random Forest classification with a
                calibrated decision threshold.
              </div>
            </div>

            <div className="rounded-lg border border-border/10 p-3">
              <div className="font-semibold">
                Commodity Forecast
              </div>

              <div className="text-muted-foreground mt-1">
                XGBoost time-series forecasting using
                historical commodity prices.
              </div>
            </div>

            <div className="rounded-lg border border-border/10 p-3">
              <div className="font-semibold">
                Anomaly Detection
              </div>

              <div className="text-muted-foreground mt-1">
                Isolation Forest identifies unusual
                vendor patterns for investigation.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}