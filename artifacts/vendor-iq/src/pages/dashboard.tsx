import {
  useListRiskScores,
  useListFraudAlerts,
  useListCommodityForecasts,
  useGetCommodityForecast,
} from "@workspace/api-client-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const USD_TO_INR = 95.9071;

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function getRiskColor(level: string) {
  switch (level.toLowerCase()) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "warning";
    default:
      return "default";
  }
}

export default function Dashboard() {
  const {
    data: riskResponse,
    isLoading: isRiskLoading,
  } = useListRiskScores();

  const {
    data: fraudResponse,
    isLoading: isFraudLoading,
  } = useListFraudAlerts({
    status: "open",
  });

  const {
    data: commoditiesResponse,
    isLoading: isCommoditiesLoading,
  } = useListCommodityForecasts();

  const riskScores = Array.isArray(riskResponse)
    ? riskResponse
    : [];

  const fraudAlerts = Array.isArray(fraudResponse)
    ? fraudResponse
    : [];

  const commodities = Array.isArray(
    commoditiesResponse,
  )
    ? commoditiesResponse
    : [];

  const activeCommodity =
    commodities[0]?.commodity === "Natural Gas"
      ? "natural_gas_us"
      : commodities[0]?.commodity
          ?.toLowerCase()
          .replace(/\s+/g, "_") ??
        "natural_gas_us";

  const {
    data: forecastResponse,
    isLoading: isForecastLoading,
  } = useGetCommodityForecast(activeCommodity, {
    query: {
      queryKey: [
        "dashboard-commodity-forecast",
        activeCommodity,
      ],
      enabled: commodities.length > 0,
    },
  });

  const forecast = forecastResponse as
    | {
        commodity?: string;
        currentPrice?: number;
        forecastPrice?: number;
        changePercent?: number;
        trend?: string;
        unit?: string;
      }
    | undefined;

  const totalSuppliers = riskScores.length;

  const highRiskSuppliers = riskScores.filter(
    (supplier) =>
      supplier.riskLevel === "high" ||
      supplier.riskLevel === "critical",
  ).length;

  const criticalSuppliers = riskScores.filter(
    (supplier) =>
      supplier.riskLevel === "critical",
  ).length;

  const averageRisk =
    totalSuppliers > 0
      ? riskScores.reduce(
          (sum, supplier) =>
            sum + Number(supplier.score ?? 0),
          0,
        ) / totalSuppliers
      : 0;

  const riskDistribution = [
    {
      level: "Low",
      count: riskScores.filter(
        (supplier) =>
          supplier.riskLevel === "low",
      ).length,
    },
    {
      level: "Medium",
      count: riskScores.filter(
        (supplier) =>
          supplier.riskLevel === "medium",
      ).length,
    },
    {
      level: "High",
      count: riskScores.filter(
        (supplier) =>
          supplier.riskLevel === "high",
      ).length,
    },
    {
      level: "Critical",
      count: criticalSuppliers,
    },
  ];

  const topRiskSuppliers = [...riskScores]
    .sort(
      (a, b) =>
        Number(b.score ?? 0) -
        Number(a.score ?? 0),
    )
    .slice(0, 5);

  const isLoading =
    isRiskLoading ||
    isFraudLoading ||
    isCommoditiesLoading;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
          Executive Command Center
        </h1>

        <p className="text-muted-foreground">
          Real-time procurement intelligence powered by supplier risk,
          anomaly detection, and commodity forecasting.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Suppliers Analyzed
            </CardTitle>

            <Users className="h-4 w-4 text-primary" />
          </CardHeader>

          <CardContent>
            {isRiskLoading ? (
              <div className="h-8 w-20 bg-muted/20 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-display font-bold">
                  {totalSuppliers}
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Risk-scored supplier portfolio
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              High-Risk Suppliers
            </CardTitle>

            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>

          <CardContent>
            {isRiskLoading ? (
              <div className="h-8 w-20 bg-muted/20 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-display font-bold text-destructive">
                  {highRiskSuppliers}
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  High + critical risk
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Anomalies
            </CardTitle>

            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </CardHeader>

          <CardContent>
            {isFraudLoading ? (
              <div className="h-8 w-20 bg-muted/20 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-display font-bold text-amber-400">
                  {fraudAlerts.length}
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Vendors requiring investigation
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Risk Score
            </CardTitle>

            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>

          <CardContent>
            {isRiskLoading ? (
              <div className="h-8 w-20 bg-muted/20 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-display font-bold">
                  {averageRisk.toFixed(1)}
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Across the analyzed portfolio
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle>
              Supplier Risk Distribution
            </CardTitle>

            <CardDescription>
              Current ML-generated supplier risk levels
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isRiskLoading ? (
              <div className="h-[300px] bg-muted/20 animate-pulse rounded-md" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={riskDistribution}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <XAxis
                      dataKey="level"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          "hsl(var(--card))",
                        borderColor:
                          "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />

                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle>
              Commodity Outlook
            </CardTitle>

            <CardDescription>
              Latest ML forecast
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isForecastLoading ||
            isCommoditiesLoading ? (
              <div className="space-y-4">
                <div className="h-8 w-40 bg-muted/20 animate-pulse rounded" />
                <div className="h-16 bg-muted/20 animate-pulse rounded" />
                <div className="h-12 bg-muted/20 animate-pulse rounded" />
              </div>
            ) : forecast ? (
              <div className="space-y-6">
                <div>
                  <div className="text-lg font-semibold">
                    {forecast.commodity ??
                      "Commodity"}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {forecast.unit ??
                      "USD / unit"}
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-display font-bold">
                    {formatINR(
                      Number(
                        forecast.currentPrice ??
                          0,
                      ) * USD_TO_INR,
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    Latest observed price
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-muted/20 p-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Forecast
                    </div>

                    <div className="font-semibold">
                      {formatINR(
                        Number(
                          forecast.forecastPrice ??
                            0,
                        ) * USD_TO_INR,
                      )}
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1 font-semibold ${
                      Number(
                        forecast.changePercent ??
                          0,
                      ) >= 0
                        ? "text-emerald-400"
                        : "text-destructive"
                    }`}
                  >
                    {Number(
                      forecast.changePercent ??
                        0,
                    ) >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}

                    {Number(
                      forecast.changePercent ??
                        0,
                    ) >= 0
                      ? "+"
                      : ""}
                    {Number(
                      forecast.changePercent ??
                        0,
                    ).toFixed(2)}
                    %
                  </div>
                </div>

                <Badge variant="outline">
                  {forecast.trend
                    ? `${forecast.trend.toUpperCase()} TREND`
                    : "ML FORECAST"}
                </Badge>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Forecast data unavailable.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Highest-Risk Suppliers
              </CardTitle>

              <CardDescription>
                Suppliers currently requiring the most attention
              </CardDescription>
            </div>

            <ShieldCheck className="h-5 w-5 text-destructive" />
          </CardHeader>

          <CardContent>
            {isRiskLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-14 bg-muted/20 animate-pulse rounded-md"
                    />
                  ),
                )}
              </div>
            ) : topRiskSuppliers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No risk data available.
              </div>
            ) : (
              <div className="space-y-3">
                {topRiskSuppliers.map(
                  (supplier, index) => (
                    <div
                      key={
                        supplier.supplierId ??
                        index
                      }
                      className="flex items-center justify-between rounded-lg border border-border/10 bg-muted/10 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                          {index + 1}
                        </div>

                        <div>
                          <div className="font-medium">
                            {supplier.supplierName}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {supplier.riskLevel
                              ?.toUpperCase() ??
                              "UNKNOWN"}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={
                          getRiskColor(
                            supplier.riskLevel ??
                              "low",
                          ) as any
                        }
                      >
                        {Number(
                          supplier.score ?? 0,
                        ).toFixed(1)}
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Active Anomaly Queue
              </CardTitle>

              <CardDescription>
                Highest-scoring vendor anomalies
              </CardDescription>
            </div>

            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </CardHeader>

          <CardContent>
            {isFraudLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-14 bg-muted/20 animate-pulse rounded-md"
                    />
                  ),
                )}
              </div>
            ) : fraudAlerts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No active anomalies.
              </div>
            ) : (
              <div className="space-y-3">
                {fraudAlerts
                  .slice(0, 5)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between rounded-lg border border-border/10 bg-muted/10 p-3"
                    >
                      <div>
                        <div className="font-medium">
                          {alert.supplierName}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {alert.type
                            .split("_")
                            .map(
                              (word) =>
                                word
                                  .charAt(0)
                                  .toUpperCase() +
                                word.slice(1),
                            )
                            .join(" ")}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            getRiskColor(
                              alert.severity,
                            ) as any
                          }
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>

                        <span className="font-mono text-xs">
                          {alert.anomalyScore?.toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">
                VendorIQ Intelligence Stack
              </div>

              <div className="text-sm text-muted-foreground mt-1">
                Risk ML + commodity forecasting + vendor anomaly detection
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                Risk ML
              </Badge>

              <Badge variant="outline">
                XGBoost Forecast
              </Badge>

              <Badge variant="outline">
                Isolation Forest
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}