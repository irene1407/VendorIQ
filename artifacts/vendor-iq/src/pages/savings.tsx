import { useGetSavingsSummary } from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  PiggyBank,
  ShieldCheck,
  Clock,
  TrendingUp,
  Sparkles,
  Settings2,
  Download,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

type ROIParameters = {
  annualProcurementSpend: number;
  directSavingsRate: number;
  anomalyRecoveryRate: number;
  riskMitigationRate: number;
  analystHourlyCost: number;
  analystHoursSaved: number;
  annualVendorIQCost: number;
};

const DEFAULT_PARAMETERS: ROIParameters = {
  annualProcurementSpend: 100000000,
  directSavingsRate: 3,
  anomalyRecoveryRate: 1,
  riskMitigationRate: 1,
  analystHourlyCost: 1500,
  analystHoursSaved: 2400,
  annualVendorIQCost: 1200000,
};

function formatINRCompact(value: number) {
  if (!Number.isFinite(value)) return "₹0";

  const absolute = Math.abs(value);

  if (absolute >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }

  if (absolute >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (absolute >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("en-IN");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function Savings() {
  const { data: summary, isLoading } = useGetSavingsSummary();

  const [showParameters, setShowParameters] = useState(false);

  const [parameters, setParameters] =
    useState<ROIParameters>(DEFAULT_PARAMETERS);

  const updateParameter = (
    key: keyof ROIParameters,
    value: number,
  ) => {
    setParameters((previous) => ({
      ...previous,
      [key]: Number.isFinite(value) ? value : 0,
    }));
  };

  const resetParameters = () => {
    setParameters(DEFAULT_PARAMETERS);
  };

  const roi = useMemo(() => {
    const directSavings =
      parameters.annualProcurementSpend *
      (parameters.directSavingsRate / 100);

    const anomalyRecovery =
      parameters.annualProcurementSpend *
      (parameters.anomalyRecoveryRate / 100);

    const riskMitigation =
      parameters.annualProcurementSpend *
      (parameters.riskMitigationRate / 100);

    const analystValue =
      parameters.analystHourlyCost *
      parameters.analystHoursSaved;

    const totalAnnualValue =
      directSavings +
      anomalyRecovery +
      riskMitigation +
      analystValue;

    const netAnnualValue =
      totalAnnualValue -
      parameters.annualVendorIQCost;

    const roiPercent =
      parameters.annualVendorIQCost > 0
        ? (netAnnualValue / parameters.annualVendorIQCost) * 100
        : 0;

    const paybackMonths =
      totalAnnualValue > 0
        ? (parameters.annualVendorIQCost / totalAnnualValue) * 12
        : 0;

    const year1 = totalAnnualValue;
    const year2 = totalAnnualValue * 1.12;
    const year3 = totalAnnualValue * 1.25;

    return {
      directSavings,
      anomalyRecovery,
      riskMitigation,
      analystValue,
      totalAnnualValue,
      netAnnualValue,
      roiPercent,
      paybackMonths,
      year1,
      year2,
      year3,
    };
  }, [parameters]);

  const chartData = useMemo(() => {
    const ytdSavings = Array.isArray(summary?.ytdSavings)
      ? summary.ytdSavings
      : [];

    if (ytdSavings.length > 0) {
      return ytdSavings;
    }

    return [
      {
        month: "Year 1",
        savings: roi.directSavings,
        fraud: roi.anomalyRecovery,
        risk: roi.riskMitigation,
      },
    ];
  }, [
    summary?.ytdSavings,
    roi.directSavings,
    roi.anomalyRecovery,
    roi.riskMitigation,
  ]);

  const totalSavings =
    Number(summary?.totalSavings ?? 0);

  const fraudPrevented =
    Number(summary?.fraudPrevented ?? 0);

  const riskReduction =
    Number(summary?.riskReduction ?? 0);

  const timeSaved =
    Number(summary?.timeSaved ?? 0);

  const generateExecutiveReport = () => {
    const generatedAt = new Date().toLocaleString("en-IN");

    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>VendorIQ Executive Report</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background: #f7f7f7;
    color: #171717;
    margin: 0;
    padding: 40px;
  }

  .container {
    max-width: 900px;
    margin: auto;
    background: white;
    padding: 40px;
    border-radius: 12px;
  }

  h1 {
    margin-bottom: 6px;
  }

  h2 {
    margin-top: 32px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
  }

  .muted {
    color: #666;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 20px;
  }

  .metric {
    border: 1px solid #ddd;
    padding: 18px;
    border-radius: 8px;
  }

  .metric-label {
    color: #666;
    font-size: 13px;
  }

  .metric-value {
    font-size: 25px;
    font-weight: bold;
    margin-top: 6px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }

  th {
    background: #f2f2f2;
  }

  .footer {
    margin-top: 40px;
    color: #777;
    font-size: 12px;
  }
</style>
</head>

<body>
<div class="container">

  <h1>VendorIQ Executive Report</h1>
  <div class="muted">Generated ${generatedAt}</div>

  <h2>Executive Summary</h2>

  <div class="grid">
    <div class="metric">
      <div class="metric-label">Savings Identified</div>
      <div class="metric-value">${formatCurrency(totalSavings)}</div>
    </div>

    <div class="metric">
      <div class="metric-label">Fraud / Anomaly Value</div>
      <div class="metric-value">${formatCurrency(fraudPrevented)}</div>
    </div>

    <div class="metric">
      <div class="metric-label">Risk Exposure Reduced</div>
      <div class="metric-value">${formatCurrency(riskReduction)}</div>
    </div>

    <div class="metric">
      <div class="metric-label">Analyst Hours Saved</div>
      <div class="metric-value">${formatNumber(timeSaved)} hrs</div>
    </div>
  </div>

  <h2>ROI Configuration</h2>

  <table>
    <tr>
      <th>Parameter</th>
      <th>Value</th>
    </tr>
    <tr>
      <td>Annual Procurement Spend</td>
      <td>${formatCurrency(parameters.annualProcurementSpend)}</td>
    </tr>
    <tr>
      <td>Direct Savings Rate</td>
      <td>${parameters.directSavingsRate.toFixed(1)}%</td>
    </tr>
    <tr>
      <td>Anomaly Recovery Rate</td>
      <td>${parameters.anomalyRecoveryRate.toFixed(1)}%</td>
    </tr>
    <tr>
      <td>Risk Mitigation Rate</td>
      <td>${parameters.riskMitigationRate.toFixed(1)}%</td>
    </tr>
    <tr>
      <td>Analyst Hourly Cost</td>
      <td>${formatCurrency(parameters.analystHourlyCost)}</td>
    </tr>
    <tr>
      <td>Analyst Hours Saved</td>
      <td>${formatNumber(parameters.analystHoursSaved)} hrs</td>
    </tr>
    <tr>
      <td>Annual VendorIQ Cost</td>
      <td>${formatCurrency(parameters.annualVendorIQCost)}</td>
    </tr>
  </table>

  <h2>ROI Projection</h2>

  <div class="grid">
    <div class="metric">
      <div class="metric-label">Estimated ROI</div>
      <div class="metric-value">${roi.roiPercent.toFixed(0)}%</div>
    </div>

    <div class="metric">
      <div class="metric-label">Payback Period</div>
      <div class="metric-value">${roi.paybackMonths.toFixed(1)} months</div>
    </div>

    <div class="metric">
      <div class="metric-label">Year 1 Value</div>
      <div class="metric-value">${formatCurrency(roi.year1)}</div>
    </div>

    <div class="metric">
      <div class="metric-label">Year 3 Value</div>
      <div class="metric-value">${formatCurrency(roi.year3)}</div>
    </div>
  </div>

  <h2>Projected Value</h2>

  <table>
    <tr>
      <th>Year</th>
      <th>Projected Value</th>
    </tr>
    <tr>
      <td>Year 1</td>
      <td>${formatCurrency(roi.year1)}</td>
    </tr>
    <tr>
      <td>Year 2</td>
      <td>${formatCurrency(roi.year2)}</td>
    </tr>
    <tr>
      <td>Year 3</td>
      <td>${formatCurrency(roi.year3)}</td>
    </tr>
  </table>

  <div class="footer">
    VendorIQ executive report. ROI figures are scenario-based estimates derived from the configured assumptions.
  </div>

</div>
</body>
</html>
`;

    const blob = new Blob([reportHtml], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `VendorIQ-Executive-Report-${new Date()
      .toISOString()
      .slice(0, 10)}.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-emerald-400 flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Value Dashboard
          </h1>

          <p className="text-muted-foreground">
            Quantifiable ROI and savings generated by VendorIQ intelligence.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={generateExecutiveReport}
          className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Executive Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400">
              Total Savings Identified
            </CardTitle>

            <PiggyBank className="h-4 w-4 text-emerald-400" />
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold font-display text-emerald-400">
                  {formatCurrency(totalSavings)}
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  YTD cumulative
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Fraud / Anomaly Value
            </CardTitle>

            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold font-display">
                {formatCurrency(fraudPrevented)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Risk Exposure Reduced
            </CardTitle>

            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold font-display">
                {formatCurrency(riskReduction)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Analyst Hours Saved
            </CardTitle>

            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold font-display">
                {formatNumber(timeSaved)} hrs
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              ROI Scenario Configuration
            </CardTitle>

            <CardDescription>
              Adjust the assumptions used to calculate projected VendorIQ value.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowParameters((previous) => !previous)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            {showParameters ? "Hide Parameters" : "Adjust Parameters"}
          </Button>
        </CardHeader>

        {showParameters && (
          <CardContent className="border-t border-border/10 pt-6">

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Annual Procurement Spend
                </label>

                <input
                  type="number"
                  min={0}
                  step={1000000}
                  value={parameters.annualProcurementSpend}
                  onChange={(e) =>
                    updateParameter(
                      "annualProcurementSpend",
                      Number(e.target.value),
                    )
                  }
                  className="w-full rounded-md border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <div className="text-xs text-muted-foreground">
                  {formatINRCompact(parameters.annualProcurementSpend)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Direct Savings Rate %
                </label>

                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.1}
                  value={parameters.directSavingsRate}
                  onChange={(e) =>
                    updateParameter(
                      "directSavingsRate",
                      clamp(Number(e.target.value), 0, 20),
                    )
                  }
                  className="w-full rounded-md border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <div className="text-xs text-muted-foreground">
                  {parameters.directSavingsRate.toFixed(1)}% of spend
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Anomaly Recovery Rate %
                </label>

                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={parameters.anomalyRecoveryRate}
                  onChange={(e) =>
                    updateParameter(
                      "anomalyRecoveryRate",
                      clamp(Number(e.target.value), 0, 10),
                    )
                  }
                  className="w-full rounded-md border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <div className="text-xs text-muted-foreground">
                  Value recovered from anomalies
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Risk Mitigation Rate %
                </label>

                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={parameters.riskMitigationRate}
                  onChange={(e) =>
                    updateParameter(
                      "riskMitigationRate",
                      clamp(Number(e.target.value), 0, 10),
                    )
                  }
                  className="w-full rounded-md border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <div className="text-xs text-muted-foreground">
                  Avoided exposure from risk intervention
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Analyst Hourly Cost
                </label>

                <input
                  type="number"
                  min={0}
                  step={100}
                  value={parameters.analystHourlyCost}
                  onChange={(e) =>
                    updateParameter(
                      "analystHourlyCost",
                      Math.max(0, Number(e.target.value)),
                    )
                  }
                  className="w-full rounded-md border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <div className="text-xs text-muted-foreground">
                  Cost per analyst hour
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Analyst Hours Saved
                </label>

                <input
                  type="number"
                  min={0}
                  step={100}
                  value={parameters.analystHoursSaved}
                  onChange={(e) =>
                    updateParameter(
                      "analystHoursSaved",
                      Math.max(0, Number(e.target.value)),
                    )
                  }
                  className="w-full rounded-md border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <div className="text-xs text-muted-foreground">
                  Annual productivity savings
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Annual VendorIQ Cost
                </label>

                <input
                  type="number"
                  min={0}
                  step={100000}
                  value={parameters.annualVendorIQCost}
                  onChange={(e) =>
                    updateParameter(
                      "annualVendorIQCost",
                      Math.max(0, Number(e.target.value)),
                    )
                  }
                  className="w-full rounded-md border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />

                <div className="text-xs text-muted-foreground">
                  Subscription + operating cost
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={resetParameters}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Assumptions
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-3">

        <Card className="bg-primary/10 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-primary">
              Scenario ROI
            </CardTitle>

            <CardDescription>
              Based on your current assumptions
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-4xl font-display font-bold text-primary">
              {roi.roiPercent.toFixed(0)}%
            </div>

            <div className="mt-3 text-sm text-muted-foreground">
              Net annual value:
              <span className="font-semibold text-foreground ml-1">
                {formatCurrency(roi.netAnnualValue)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle className="text-sm">
              Annual Value Generated
            </CardTitle>

            <CardDescription>
              Before VendorIQ operating cost
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-4xl font-display font-bold">
              {formatCurrency(roi.totalAnnualValue)}
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Direct savings + anomaly recovery + risk mitigation + analyst productivity
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle className="text-sm">
              Payback Period
            </CardTitle>

            <CardDescription>
              Time to recover annual VendorIQ cost
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-4xl font-display font-bold">
              {roi.paybackMonths.toFixed(1)}
              <span className="text-lg ml-1 text-muted-foreground">
                months
              </span>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Lower is faster recovery
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        <Card className="md:col-span-2 bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle>Savings Trajectory</CardTitle>

            <CardDescription>
              Monthly breakdown of observed value generation
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="h-[400px] w-full bg-muted/20 animate-pulse rounded-md" />
            ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                    />

                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) =>
                        `₹${(Number(value) / 100000).toFixed(1)}L`
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) =>
                        formatCurrency(Number(value))
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="savings"
                      name="Direct Savings"
                      stackId="a"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.8}
                    />

                    <Bar
                      dataKey="fraud"
                      name="Anomaly Recovery"
                      stackId="a"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.8}
                    />

                    <Bar
                      dataKey="risk"
                      name="Risk Mitigated"
                      stackId="a"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle>ROI Projection</CardTitle>

            <CardDescription>
              Scenario-based value over the next 3 years
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6 mt-4">

              <div className="p-4 bg-muted/20 border border-border/20 rounded-lg">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Estimated ROI
                </div>

                <div className="text-4xl font-display font-bold text-primary">
                  {roi.roiPercent.toFixed(0)}%
                </div>

                <div className="text-sm mt-2 text-foreground/80">
                  Payback period:
                  <span className="font-bold ml-1">
                    {roi.paybackMonths.toFixed(1)} months
                  </span>
                </div>
              </div>

              <div className="space-y-3">

                <div className="flex justify-between items-center text-sm border-b border-border/10 pb-2">
                  <span className="text-muted-foreground">
                    Year 1 Projection
                  </span>

                  <span className="font-mono font-medium">
                    {formatINRCompact(roi.year1)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-border/10 pb-2">
                  <span className="text-muted-foreground">
                    Year 2 Projection
                  </span>

                  <span className="font-mono font-medium">
                    {formatINRCompact(roi.year2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-border/10 pb-2">
                  <span className="text-muted-foreground">
                    Year 3 Projection
                  </span>

                  <span className="font-mono font-medium">
                    {formatINRCompact(roi.year3)}
                  </span>
                </div>

              </div>

              <Button
                className="w-full"
                variant="secondary"
                onClick={() => setShowParameters(true)}
              >
                <Settings2 className="h-4 w-4 mr-2" />
                Adjust ROI Parameters
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <CardHeader>
          <CardTitle>Value Breakdown</CardTitle>

          <CardDescription>
            Where the projected annual value comes from
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">

            <div className="rounded-lg border border-border/10 bg-muted/10 p-4">
              <div className="text-xs text-muted-foreground">
                Direct Savings
              </div>

              <div className="text-xl font-bold mt-1">
                {formatINRCompact(roi.directSavings)}
              </div>
            </div>

            <div className="rounded-lg border border-border/10 bg-muted/10 p-4">
              <div className="text-xs text-muted-foreground">
                Anomaly Recovery
              </div>

              <div className="text-xl font-bold mt-1">
                {formatINRCompact(roi.anomalyRecovery)}
              </div>
            </div>

            <div className="rounded-lg border border-border/10 bg-muted/10 p-4">
              <div className="text-xs text-muted-foreground">
                Risk Mitigation
              </div>

              <div className="text-xl font-bold mt-1">
                {formatINRCompact(roi.riskMitigation)}
              </div>
            </div>

            <div className="rounded-lg border border-border/10 bg-muted/10 p-4">
              <div className="text-xs text-muted-foreground">
                Analyst Productivity
              </div>

              <div className="text-xl font-bold mt-1">
                {formatINRCompact(roi.analystValue)}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <div className="font-semibold">
                Scenario assumptions
              </div>

              <div className="text-sm text-muted-foreground mt-1">
                ROI projections are scenario estimates, not realized financial results.
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border/20 px-3 py-1">
                Spend: {formatINRCompact(parameters.annualProcurementSpend)}
              </span>

              <span className="rounded-full border border-border/20 px-3 py-1">
                Savings: {parameters.directSavingsRate.toFixed(1)}%
              </span>

              <span className="rounded-full border border-border/20 px-3 py-1">
                Recovery: {parameters.anomalyRecoveryRate.toFixed(1)}%
              </span>

              <span className="rounded-full border border-border/20 px-3 py-1">
                Risk: {parameters.riskMitigationRate.toFixed(1)}%
              </span>
            </div>

          </div>
        </CardContent>
      </Card>

    </div>
  );
}