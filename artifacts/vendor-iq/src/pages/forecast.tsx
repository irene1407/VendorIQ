import {
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
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
} from "lucide-react";
import { useState } from "react";

type Commodity = {
  id: string;
  commodity: string;
  unit: string;
};

type ForecastData = {
  commodity: string;
  unit: string;
  currentPrice: number;
  forecastPrice: number;
  change: number;
  changePercent: number;
  trend: string;
  confidence: number;
  points: Array<{
    date: string;
    actual: number | null;
    predicted: number | null;
    lowerBound: number | null;
    upperBound: number | null;
  }>;
};

const USD_TO_INR = 95.9071;

function convertUsdToInr(value: number) {
  if (!Number.isFinite(value)) {
    return NaN;
  }

  return value * USD_TO_INR;
}

function formatPrice(value: number) {
  const inrValue = convertUsdToInr(value);

  if (!Number.isFinite(inrValue)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(inrValue);
}

function formatChartPrice(value: number) {
  const inrValue = convertUsdToInr(value);

  if (!Number.isFinite(inrValue)) {
    return "N/A";
  }

  return `₹${inrValue.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return (
        <TrendingUp className="h-4 w-4 text-destructive" />
      );

    case "down":
      return (
        <TrendingDown className="h-4 w-4 text-emerald-500" />
      );

    default:
      return (
        <Minus className="h-4 w-4 text-muted-foreground" />
      );
  }
}

function getTrendColor(trend: string) {
  switch (trend) {
    case "up":
      return "text-destructive";

    case "down":
      return "text-emerald-500";

    default:
      return "text-muted-foreground";
  }
}

function CommodityCard({
  commodity,
  isActive,
  onClick,
}: {
  commodity: Commodity;
  isActive: boolean;
  onClick: () => void;
}) {
  const { data: forecast, isLoading } =
    useGetCommodityForecast(commodity.id, {
      query: {
        queryKey: ["commodity-forecast", commodity.id],
      },
    });

  const forecastData = forecast as ForecastData | undefined;

  return (
    <Card
      className={`bg-card/50 backdrop-blur cursor-pointer transition-colors ${
        isActive
          ? "border-primary"
          : "border-border/10 hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
            <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
            <div className="h-8 w-28 bg-muted/30 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {commodity.commodity}
                </div>

                <div className="text-xs text-muted-foreground mt-0.5">
                  95% prediction interval
                </div>
              </div>

              {getTrendIcon(forecastData?.trend ?? "stable")}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <div className="text-2xl font-bold font-display">
                {formatPrice(
                  forecastData?.forecastPrice ?? NaN,
                )}
              </div>

              <div
                className={`text-xs font-medium ${getTrendColor(
                  forecastData?.trend ?? "stable",
                )}`}
              >
                {Number.isFinite(forecastData?.changePercent)
                  ? `${forecastData!.change > 0 ? "+" : ""}${forecastData!.changePercent.toFixed(2)}%`
                  : "N/A"}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Forecast() {
  const {
    data: commoditiesResponse,
    isLoading: isCommoditiesLoading,
  } = useListCommodityForecasts();

  const commodities: Commodity[] = Array.isArray(
    commoditiesResponse,
  )
    ? commoditiesResponse.map((item) => ({
        id:
          item.commodity === "Natural Gas"
            ? "natural_gas_us"
            : item.commodity.toLowerCase().replace(/\s+/g, "_"),
        commodity: item.commodity,
        unit: item.unit ?? "USD/Unit",
      }))
    : [];

  const [selectedCommodity, setSelectedCommodity] =
    useState<string | null>(null);

  const activeCommodity =
    selectedCommodity ??
    commodities[0]?.id ??
    "natural_gas_us";

  const activeCommodityDetails =
    commodities.find(
      (commodity) => commodity.id === activeCommodity,
    );

  const { data: forecastResponse, isLoading: isForecastLoading } =
    useGetCommodityForecast(activeCommodity, {
      query: {
        queryKey: ["commodity-forecast", activeCommodity],
        enabled: !!activeCommodity,
      },
    });

  const forecast = forecastResponse as ForecastData | undefined;

  const chartData = (forecast?.points ?? []).map((point) => ({
    ...point,
    actual:
      point.actual !== null
        ? convertUsdToInr(point.actual)
        : null,
    predicted:
      point.predicted !== null
        ? convertUsdToInr(point.predicted)
        : null,
    lowerBound:
      point.lowerBound !== null
        ? convertUsdToInr(point.lowerBound)
        : null,
    upperBound:
      point.upperBound !== null
        ? convertUsdToInr(point.upperBound)
        : null,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Price Intelligence
        </h1>

        <p className="text-muted-foreground">
          ML-driven commodity price forecasting with confidence
          intervals.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isCommoditiesLoading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="h-32 bg-muted/20 animate-pulse border-border/10"
              />
            ))
        ) : (
          commodities.slice(0, 4).map((commodity) => (
            <CommodityCard
              key={commodity.id}
              commodity={commodity}
              isActive={activeCommodity === commodity.id}
              onClick={() =>
                setSelectedCommodity(commodity.id)
              }
            />
          ))
        )}
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10 h-[500px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/10">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />

              {activeCommodityDetails?.commodity ??
                forecast?.commodity ??
                "Commodity"}{" "}
              Forecast Model
            </CardTitle>

            <CardDescription>
              Historical actuals and 3-month predictive bands
            </CardDescription>
          </div>

          <Badge
            variant="outline"
            className="font-mono"
          >
            INR
          </Badge>
        </CardHeader>

        <CardContent className="flex-1 p-6">
          {isForecastLoading ? (
            <div className="w-full h-full bg-muted/20 animate-pulse rounded-md" />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <ComposedChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        year: "2-digit",
                      },
                    )
                  }
                />

                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  domain={["auto", "auto"]}
                  tickFormatter={formatChartPrice}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      "hsl(var(--card))",
                    borderColor:
                      "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString(
                      undefined,
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      },
                    )
                  }
                />

                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />

                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="hsl(var(--background))"
                  fillOpacity={1}
                />

                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: "hsl(var(--foreground))",
                  }}
                  activeDot={{ r: 6 }}
                  name="Historical Actual"
                />

                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="AI Forecast"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}