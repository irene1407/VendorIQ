import {
  useListExperiments,
  useGetExperiment,
} from "@workspace/api-client-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  TestTube,
  SquareTerminal,
  AlertTriangle,
  FlaskConical,
} from "lucide-react";

import { useState } from "react";

type ExperimentRecord = {
  id: string;
  name: string;
  model: string;
  status: string;
  metrics?: {
    accuracy?: number | null;
    f1Score?: number | null;
  };
};

type MetricPoint = {
  step: number;
  trainLoss?: number | null;
  valLoss?: number | null;
};

function getStatusVariant(
  status: string,
): "default" | "destructive" | "secondary" | "outline" {
  switch (status.toLowerCase()) {
    case "running":
      return "default";

    case "failed":
      return "destructive";

    case "completed":
    case "complete":
      return "secondary";

    default:
      return "outline";
  }
}

function formatMetric(
  value: number | null | undefined,
  digits = 4,
) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-";
}

export default function Experiments() {
  const {
    data: experiments,
    isLoading: isListLoading,
    isError: isListError,
  } = useListExperiments();

  const experimentsList: ExperimentRecord[] =
    Array.isArray(experiments)
      ? (experiments as ExperimentRecord[])
      : [];

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeId =
    selectedId ??
    experimentsList[0]?.id ??
    null;

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetExperiment(
    activeId as string,
    {
      query: {
        queryKey: ["experiment", activeId],
        enabled: Boolean(activeId),
      },
    },
  );

  const detailMetricHistory: MetricPoint[] =
    Array.isArray(detail?.metricHistory)
      ? (detail.metricHistory as MetricPoint[])
      : [];

  const latestMetrics =
    detailMetricHistory.length > 0
      ? detailMetricHistory[
          detailMetricHistory.length - 1
        ]
      : undefined;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">
              Experiment Tracker
            </h1>

            <p className="text-muted-foreground">
              Inspect model training runs, hyperparameters, and evaluation metrics.
            </p>
          </div>
        </div>
      </div>

      {isListError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold text-destructive">
                Unable to load experiments
              </p>

              <p className="text-sm text-muted-foreground mt-1">
                The experiment service did not return a valid response.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur border-border/10 flex flex-col h-[700px]">
          <CardHeader className="border-b border-border/10 pb-3">
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Training Runs
            </CardTitle>

            <CardDescription>
              Available model experiments and evaluation results.
            </CardDescription>
          </CardHeader>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experiment</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    F1 Score
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isListLoading ? (
                  <>
                    {[1, 2, 3, 4].map((row) => (
                      <TableRow key={row}>
                        <TableCell
                          colSpan={4}
                          className="h-14"
                        >
                          <div className="h-4 w-full bg-muted/30 animate-pulse rounded" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : experimentsList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-48 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <TestTube className="h-8 w-8 text-muted-foreground mb-3" />

                        <p className="font-medium">
                          No experiments available
                        </p>

                        <p className="text-sm text-muted-foreground mt-1">
                          Training runs will appear here when available.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  experimentsList.map((experiment) => {
                    const isActive =
                      activeId === experiment.id;

                    const status =
                      String(
                        experiment.status ?? "unknown",
                      );

                    return (
                      <TableRow
                        key={experiment.id}
                        onClick={() =>
                          setSelectedId(experiment.id)
                        }
                        className={`cursor-pointer transition-colors ${
                          isActive
                            ? "bg-primary/10"
                            : "hover:bg-muted/20"
                        }`}
                      >
                        <TableCell className="font-medium text-xs font-mono">
                          {experiment.name}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {experiment.model || "-"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={getStatusVariant(status)}
                            className="text-[10px]"
                          >
                            {status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs">
                          {formatMetric(
                            experiment.metrics?.f1Score,
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border/10">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <CardTitle className="font-mono text-lg truncate">
                    {detail?.name || "Select a run"}
                  </CardTitle>

                  <CardDescription>
                    Model: {detail?.model || "-"}
                  </CardDescription>
                </div>

                {detail?.status && (
                  <Badge
                    variant={getStatusVariant(
                      String(detail.status),
                    )}
                    className={
                      String(detail.status).toLowerCase() ===
                      "running"
                        ? "animate-pulse"
                        : ""
                    }
                  >
                    {String(detail.status).toUpperCase()}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {!activeId ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                  <TestTube className="h-10 w-10 mb-4" />

                  <p className="font-medium">
                    Select an experiment
                  </p>

                  <p className="text-sm mt-1">
                    Choose a training run from the table.
                  </p>
                </div>
              ) : isDetailLoading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-20 bg-muted/20 animate-pulse rounded"
                      />
                    ))}
                  </div>

                  <div className="h-[250px] bg-muted/20 animate-pulse rounded" />
                </div>
              ) : isDetailError ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center">
                  <AlertTriangle className="h-8 w-8 text-destructive mb-3" />

                  <p className="font-medium">
                    Unable to load experiment details
                  </p>

                  <p className="text-sm text-muted-foreground mt-1">
                    Select another training run to continue.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded border border-border/10 mb-6">
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Accuracy
                      </div>

                      <div className="font-mono font-medium">
                        {formatMetric(
                          detail?.metrics?.accuracy,
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        F1 Score
                      </div>

                      <div className="font-mono font-medium text-primary">
                        {formatMetric(
                          detail?.metrics?.f1Score,
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Val Loss
                      </div>

                      <div className="font-mono font-medium">
                        {formatMetric(
                          latestMetrics?.valLoss,
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold mb-4">
                    Training Curves
                  </h3>

                  {detailMetricHistory.length === 0 ? (
                    <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground border border-border/10 rounded-lg bg-muted/10">
                      <TestTube className="h-7 w-7 mb-3" />

                      <p className="text-sm font-medium">
                        No training history available
                      </p>
                    </div>
                  ) : (
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <LineChart
                          data={detailMetricHistory}
                          margin={{
                            top: 5,
                            right: 5,
                            left: -20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="step"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                          />

                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
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

                          <Line
                            type="monotone"
                            dataKey="trainLoss"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={2}
                            dot={false}
                            name="Train Loss"
                          />

                          <Line
                            type="monotone"
                            dataKey="valLoss"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                            name="Validation Loss"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <SquareTerminal className="h-4 w-4 text-muted-foreground" />
                Hyperparameters
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="bg-[#0a0a0a] rounded-md p-4 overflow-auto border border-border/20 min-h-[120px]">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                  {detail?.hyperparams
                    ? JSON.stringify(
                        detail.hyperparams,
                        null,
                        2,
                      )
                    : "// No hyperparameters available"}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}