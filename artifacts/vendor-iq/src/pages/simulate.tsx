import { useRunSimulation, useListSuppliers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, ArrowRight, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function Simulate() {
  const { data: suppliers } = useListSuppliers({ limit: 50 });
  const simulateMutation = useRunSimulation();
  
  const [supplierId, setSupplierId] = useState<string>("");
  const [inflationDelta, setInflationDelta] = useState([0]);
  const [shippingDelayDays, setShippingDelayDays] = useState([0]);
  const [priceDelta, setPriceDelta] = useState([0]);
  const [demandDelta, setDemandDelta] = useState([0]);

  const handleSimulate = () => {
    if (!supplierId) return;
    simulateMutation.mutate({
      data: {
        supplierId,
        scenario: {
          inflationDelta: inflationDelta[0],
          shippingDelayDays: shippingDelayDays[0],
          priceDelta: priceDelta[0],
          demandDelta: demandDelta[0]
        }
      }
    });
  };

  const result = simulateMutation.data;

  const getDirectionIcon = (dir: string) => {
    if (dir === 'better') return <TrendingDown className="h-4 w-4 text-emerald-500" />;
    if (dir === 'worse') return <TrendingUp className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4 max-w-5xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-display font-bold tracking-tight">What-If Simulator</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Stress-test your supply chain by perturbing macroeconomic features. Our causal models will predict the downstream impact on risk, price, and fraud probability.
        </p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10 overflow-visible">
        <CardHeader className="border-b border-border/10 bg-muted/10 pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Target Supplier</label>
              <select 
                className="w-full h-10 px-3 bg-background border border-border/30 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Select a supplier...</option>
                {suppliers?.items.map(s => <option key={s.id} value={s.id}>{s.name} ({s.country})</option>)}
              </select>
            </div>
            <Button onClick={handleSimulate} disabled={!supplierId || simulateMutation.isPending} className="w-full md:w-auto h-10 px-8">
              <Activity className="h-4 w-4 mr-2" /> Run Causal Inference
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Inflation Delta</label>
                <span className="font-mono text-sm">{inflationDelta[0] > 0 ? '+' : ''}{inflationDelta[0]}%</span>
              </div>
              <Slider value={inflationDelta} onValueChange={setInflationDelta} min={-10} max={20} step={0.5} className="py-2" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Global Shipping Delay</label>
                <span className="font-mono text-sm">+{shippingDelayDays[0]} days</span>
              </div>
              <Slider value={shippingDelayDays} onValueChange={setShippingDelayDays} min={0} max={60} step={1} className="py-2" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Supplier Price Delta</label>
                <span className="font-mono text-sm">{priceDelta[0] > 0 ? '+' : ''}{priceDelta[0]}%</span>
              </div>
              <Slider value={priceDelta} onValueChange={setPriceDelta} min={-30} max={50} step={1} className="py-2" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Demand Shock</label>
                <span className="font-mono text-sm">{demandDelta[0] > 0 ? '+' : ''}{demandDelta[0]}%</span>
              </div>
              <Slider value={demandDelta} onValueChange={setDemandDelta} min={-50} max={100} step={5} className="py-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {simulateMutation.isPending && (
        <div className="h-64 flex flex-col items-center justify-center text-primary animate-pulse border border-primary/20 rounded-xl bg-primary/5">
          <Activity className="h-8 w-8 mb-4 animate-spin" />
          <p className="font-mono text-sm">Computing forward pass through causal graph...</p>
        </div>
      )}

      {result && !simulateMutation.isPending && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Simulation Results</h2>
          
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-background border-border/20 shadow-lg">
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground mb-2">Predicted Risk Score</div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-display font-bold text-destructive">{result.simulated.riskScore}</div>
                  <div className="flex items-center text-xs text-muted-foreground mb-1">
                    <span className="line-through mr-1">{result.baseline.riskScore}</span>
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <span className="text-destructive font-bold">+{result.simulated.riskScore - result.baseline.riskScore}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-border/20 shadow-lg">
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground mb-2">Estimated Price Impact</div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-display font-bold">{formatCurrency(result.simulated.predictedPrice)}</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between border-t border-border/10 pt-2">
                  <span>Baseline: {formatCurrency(result.baseline.predictedPrice)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-border/20 shadow-lg">
              <CardContent className="p-5">
                <div className="text-xs text-muted-foreground mb-2">Fraud Probability</div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-display font-bold">{formatPercent(result.simulated.fraudProbability * 100)}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/20 shadow-lg">
              <CardContent className="p-5">
                <div className="text-xs text-primary font-medium mb-2">AI Recommendation Score</div>
                <div className="text-3xl font-display font-bold text-primary">{result.simulated.recommendationScore}/100</div>
                <div className="mt-2 text-xs text-primary/70">
                  {result.simulated.recommendationScore < 50 ? 'Avoid engagement' : 'Proceed with caution'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
