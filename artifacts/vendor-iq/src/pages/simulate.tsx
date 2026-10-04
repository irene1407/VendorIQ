import {
  useRunSimulation,
  useListSuppliers,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  SlidersHorizontal,
  ArrowRight,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/utils";

export default function Simulate() {
  const { data: suppliers } =
    useListSuppliers({
      limit: 50,
    });

  const simulateMutation =
    useRunSimulation();

  const [supplierId, setSupplierId] =
    useState<string>("");

  const [inflationDelta, setInflationDelta] =
    useState([0]);

  const [shippingDelayDays, setShippingDelayDays] =
    useState([0]);

  const [priceDelta, setPriceDelta] =
    useState([0]);

  const [demandDelta, setDemandDelta] =
    useState([0]);

  const handleSimulate = () => {
    if (!supplierId) {
      return;
    }

    simulateMutation.mutate({
      data: {
        supplierId,
        scenario: {
          inflationDelta:
            inflationDelta[0],
          shippingDelayDays:
            shippingDelayDays[0],
          priceDelta:
            priceDelta[0],
          demandDelta:
            demandDelta[0],
        },
      },
    });
  };

  const result =
    simulateMutation.data;

  const supplierList =
    Array.isArray(suppliers?.items)
      ? suppliers.items
      : [];

  const getDirectionIcon = (
    direction: string,
  ) => {
    if (direction === "better") {
      return (
        <TrendingDown className="h-4 w-4 text-emerald-500" />
      );
    }

    if (direction === "worse") {
      return (
        <TrendingUp className="h-4 w-4 text-destructive" />
      );
    }

    return (
      <Minus className="h-4 w-4 text-muted-foreground" />
    );
  };

  const riskChange =
    result &&
    result.simulated &&
    result.baseline
      ? result.simulated.riskScore -
        result.baseline.riskScore
      : 0;

  const priceChange =
    result &&
    result.simulated &&
    result.baseline
      ? result.simulated.predictedPrice -
        result.baseline.predictedPrice
      : 0;

  const recommendationScore =
    result?.simulated?.recommendationScore ??
    0;

  const recommendationLabel =
    recommendationScore < 50
      ? "High caution"
      : recommendationScore < 75
        ? "Proceed with caution"
        : "Relatively favorable";

  const recommendationColor =
    recommendationScore < 50
      ? "text-destructive"
      : recommendationScore < 75
        ? "text-yellow-400"
        : "text-emerald-400";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4 max-w-5xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <SlidersHorizontal className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold tracking-tight">
          What-If Simulator
        </h1>

        <p className="text-muted-foreground max-w-2xl mx-auto">
          Stress-test a supplier by changing inflation,
          shipping delays, supplier pricing, and demand.
          Compare the simulated outcome with the supplier baseline.
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10 overflow-visible">
        <CardHeader className="border-b border-border/10 bg-muted/10 pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Target Supplier
              </label>

              <select
                className="w-full h-10 px-3 bg-background border border-border/30 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={supplierId}
                onChange={(event) =>
                  setSupplierId(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select a supplier...
                </option>

                {supplierList.map(
                  (supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.name} (
                      {supplier.country})
                    </option>
                  ),
                )}
              </select>
            </div>

            <Button
              onClick={handleSimulate}
              disabled={
                !supplierId ||
                simulateMutation.isPending
              }
              className="w-full md:w-auto h-10 px-8"
            >
              <Activity className="h-4 w-4 mr-2" />

              {simulateMutation.isPending
                ? "Running scenario..."
                : "Run Scenario"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Inflation Delta
                </label>

                <span className="font-mono text-sm">
                  {inflationDelta[0] > 0
                    ? "+"
                    : ""}
                  {inflationDelta[0]}%
                </span>
              </div>

              <Slider
                value={
                  inflationDelta
                }
                onValueChange={
                  setInflationDelta
                }
                min={-10}
                max={20}
                step={0.5}
                className="py-2"
              />

              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>-10%</span>
                <span>0%</span>
                <span>+20%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Global Shipping Delay
                </label>

                <span className="font-mono text-sm">
                  +{shippingDelayDays[0]} days
                </span>
              </div>

              <Slider
                value={
                  shippingDelayDays
                }
                onValueChange={
                  setShippingDelayDays
                }
                min={0}
                max={60}
                step={1}
                className="py-2"
              />

              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0 days</span>
                <span>30 days</span>
                <span>60 days</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Supplier Price Delta
                </label>

                <span className="font-mono text-sm">
                  {priceDelta[0] > 0
                    ? "+"
                    : ""}
                  {priceDelta[0]}%
                </span>
              </div>

              <Slider
                value={priceDelta}
                onValueChange={
                  setPriceDelta
                }
                min={-30}
                max={50}
                step={1}
                className="py-2"
              />

              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>-30%</span>
                <span>0%</span>
                <span>+50%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Demand Shock
                </label>

                <span className="font-mono text-sm">
                  {demandDelta[0] > 0
                    ? "+"
                    : ""}
                  {demandDelta[0]}%
                </span>
              </div>

              <Slider
                value={
                  demandDelta
                }
                onValueChange={
                  setDemandDelta
                }
                min={-50}
                max={100}
                step={5}
                className="py-2"
              />

              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>-50%</span>
                <span>0%</span>
                <span>+100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {simulateMutation.isError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold text-destructive">
                Simulation failed
              </p>

              <p className="text-sm text-muted-foreground mt-1">
                The scenario could not be calculated.
                Check the supplier selection and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {simulateMutation.isPending && (
        <div className="h-64 flex flex-col items-center justify-center text-primary animate-pulse border border-primary/20 rounded-xl bg-primary/5">
          <Activity className="h-8 w-8 mb-4 animate-spin" />

          <p className="font-mono text-sm">
            Running supplier stress-test...
          </p>

          <p className="text-xs text-muted-foreground mt-2">
            Evaluating the selected scenario against the baseline
          </p>
        </div>
      )}

      {result &&
        !simulateMutation.isPending && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Scenario Results
                </h2>

                <p className="text-xs text-muted-foreground mt-1">
                  Simulated outcome compared with the current supplier baseline.
                </p>
              </div>

              <Badge
                variant="outline"
                className="gap-1.5"
              >
                <ShieldCheck className="h-3 w-3" />
                Scenario analysis
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-background border-border/20 shadow-lg">
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground mb-2">
                    Predicted Risk Score
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div className="text-3xl font-display font-bold">
                      {
                        result.simulated
                          .riskScore
                      }
                    </div>

                    <div className="flex items-center gap-1 text-xs mb-1">
                      {getDirectionIcon(
                        riskChange > 0
                          ? "worse"
                          : riskChange <
                              0
                            ? "better"
                            : "same",
                      )}

                      <span className="text-muted-foreground">
                        {result.baseline.riskScore}
                      </span>

                      <ArrowRight className="h-3 w-3 text-muted-foreground" />

                      <span
                        className={
                          riskChange > 0
                            ? "text-destructive font-bold"
                            : riskChange <
                                0
                              ? "text-emerald-500 font-bold"
                              : "text-muted-foreground font-bold"
                        }
                      >
                        {riskChange > 0
                          ? "+"
                          : ""}
                        {riskChange}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 rounded-full bg-card overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            Number(
                              result.simulated
                                .riskScore,
                            ),
                          ),
                        )}%`,
                        background:
                          result.simulated
                            .riskScore >=
                          70
                            ? "#EF4444"
                            : result.simulated
                                  .riskScore >=
                                40
                              ? "#F59E0B"
                              : "#22C55E",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background border-border/20 shadow-lg">
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground mb-2">
                    Estimated Price Impact
                  </div>

                  <div className="text-3xl font-display font-bold">
                    {formatCurrency(
                      result.simulated
                        .predictedPrice,
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-xs border-t border-border/10 pt-2">
                    {getDirectionIcon(
                      priceChange > 0
                        ? "worse"
                        : priceChange <
                            0
                          ? "better"
                          : "same",
                    )}

                    <span className="text-muted-foreground">
                      Baseline
                    </span>

                    <span className="font-medium">
                      {formatCurrency(
                        result.baseline
                          .predictedPrice,
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background border-border/20 shadow-lg">
                <CardContent className="p-5">
                  <div className="text-xs text-muted-foreground mb-2">
                    Fraud / Anomaly Probability
                  </div>

                  <div className="text-3xl font-display font-bold">
                    {formatPercent(
                      result.simulated
                        .fraudProbability *
                        100,
                    )}
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground border-t border-border/10 pt-2">
                    Scenario estimate returned by the simulation service
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/10 border-primary/20 shadow-lg">
                <CardContent className="p-5">
                  <div className="text-xs text-primary font-medium mb-2">
                    Recommendation Score
                  </div>

                  <div className="text-3xl font-display font-bold text-primary">
                    {
                      result.simulated
                        .recommendationScore
                    }
                    /100
                  </div>

                  <div
                    className={`mt-2 text-xs font-semibold ${recommendationColor}`}
                  >
                    {recommendationLabel}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/40 border-border/10">
              <CardContent className="p-5">
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Scenario
                    </div>

                    <div className="text-sm font-medium">
                      Inflation{" "}
                      {inflationDelta[0] >=
                      0
                        ? "+"
                        : ""}
                      {
                        inflationDelta[0]
                      }%, shipping +
                      {
                        shippingDelayDays[0]
                      }d
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Commercial Pressure
                    </div>

                    <div className="text-sm font-medium">
                      Price{" "}
                      {priceDelta[0] >=
                      0
                        ? "+"
                        : ""}
                      {priceDelta[0]}%,
                      demand{" "}
                      {demandDelta[0] >=
                      0
                        ? "+"
                        : ""}
                      {demandDelta[0]}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      Interpretation
                    </div>

                    <div className="text-sm font-medium">
                      {riskChange > 0
                        ? "Risk increases under this scenario."
                        : riskChange <
                            0
                          ? "Risk decreases under this scenario."
                          : "Risk remains unchanged under this scenario."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}