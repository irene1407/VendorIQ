import { useListRiskScores, useGetSupplierRiskHistory, useGetRiskExplanation, useGetRiskCounterfactuals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from "recharts";
import { ShieldAlert, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Risk() {
  const {
    data: scoresResponse,
    isLoading: isScoresLoading,
  } = useListRiskScores({ limit: 10 } as any);

  const scores = Array.isArray(scoresResponse) ? scoresResponse : [];

  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // Default to first supplier if none selected
  const activeSupplierId =
    selectedSupplierId ||
    (scores.length > 0 ? scores[0].supplierId : "SUP-001");

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
  } = useGetSupplierRiskHistory(activeSupplierId, {
    query: {
      queryKey: ["supplier-risk-history", activeSupplierId],
      enabled: !!activeSupplierId,
    },
  });

  const history = Array.isArray(historyResponse) ? historyResponse : [];

  const {
    data: explanation,
    isLoading: isExplanationLoading,
  } = useGetRiskExplanation(activeSupplierId, {
    query: {
      queryKey: ["risk-explanation", activeSupplierId],
      enabled: !!activeSupplierId,
    },
  });

  const {
    data: counterfactualsResponse,
    isLoading: isCounterfactualsLoading,
  } = useGetRiskCounterfactuals(activeSupplierId, {
    query: {
      queryKey: ["risk-counterfactuals", activeSupplierId],
      enabled: !!activeSupplierId,
    },
  });

  const counterfactuals = Array.isArray(counterfactualsResponse)
    ? counterfactualsResponse
    : [];
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Risk Intelligence</h1>
        <p className="text-muted-foreground">ML-driven risk scoring, feature attribution, and prescriptive mitigations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Ranked List */}
        <Card className="md:col-span-1 bg-card/50 backdrop-blur border-border/10 flex flex-col h-[800px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Risk Leaderboard</CardTitle>
            <CardDescription>Highest risk entities requiring review</CardDescription>
          </CardHeader>
          <div className="flex-1 overflow-auto p-4 pt-0 space-y-2">
            {isScoresLoading ? (
              Array(8).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-md" />)
            ) : (
              scores.map(score => (
                <div 
                  key={score.supplierId} 
                  onClick={() => setSelectedSupplierId(score.supplierId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeSupplierId === score.supplierId 
                      ? 'bg-primary/10 border-primary shadow-sm' 
                      : 'bg-background border-border/10 hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm truncate pr-2">{score.supplierName}</span>
                    <span className={`font-mono text-xs font-bold ${score.score > 75 ? 'text-destructive' : score.score > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {score.score}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant={score.riskLevel === 'critical' || score.riskLevel === 'high' ? 'destructive' : score.riskLevel === 'medium' ? 'warning' : 'success'} className="text-[10px] px-1 py-0 h-4">
                      {score.riskLevel.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">Conf: {(score.confidence || 0) * 100}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Column: Deep Dive */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border/10">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-display">{explanation?.supplierName || 'Loading...'}</CardTitle>
                <CardDescription>Risk Score: {explanation?.score} / 100</CardDescription>
              </div>
              {explanation?.riskLevel && (
                <Badge variant={explanation.score > 75 ? 'destructive' : explanation.score > 50 ? 'warning' : 'success'} className="text-sm px-3 py-1">
                  {explanation.riskLevel.toUpperCase()} RISK
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-4">
                {isHistoryLoading ? (
                  <div className="w-full h-full bg-muted/20 animate-pulse rounded-md" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        labelFormatter={(val) => new Date(val).toLocaleDateString()}
                      />
                      <Line type="monotone" dataKey="riskScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur border-border/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">SHAP Feature Attribution</CardTitle>
                <CardDescription>What's driving this risk score?</CardDescription>
              </CardHeader>
              <CardContent>
                {isExplanationLoading ? (
                  <div className="h-[250px] w-full bg-muted/20 animate-pulse rounded-md" />
                ) : (
                  <div className="space-y-4 mt-2">
                    {(explanation?.shapValues ?? []).map(feature => (
                      <div key={feature.feature} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-muted-foreground">{feature.feature}</span>
                          <span className={feature.shapValue > 0 ? 'text-destructive' : 'text-emerald-500'}>
                            {feature.shapValue > 0 ? '+' : ''}{feature.shapValue.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                          {/* Simplified waterfall visual */}
                          <div className="flex-1 bg-transparent" />
                          <div 
                            className={`h-full ${feature.shapValue > 0 ? 'bg-destructive' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(Math.abs(feature.shapValue) * 2, 50)}%`, marginLeft: feature.shapValue < 0 ? 'auto' : 0 }} 
                          />
                          <div className="flex-1 bg-transparent" />
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-border/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Counterfactual Mitigations</CardTitle>
                <CardDescription>AI recommendations to improve score</CardDescription>
              </CardHeader>
              <CardContent>
                {isCounterfactualsLoading ? (
                  <div className="h-[250px] w-full bg-muted/20 animate-pulse rounded-md" />
                ) : (
                  <div className="space-y-3 mt-2">
                    {counterfactuals?.map((cf, i) => (
                      <div key={i} className="p-3 rounded bg-background border border-border/10 relative overflow-hidden group">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${cf.difficulty === 'easy' ? 'bg-emerald-500' : cf.difficulty === 'moderate' ? 'bg-amber-500' : 'bg-destructive'}`} />
                        <div className="pl-3">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-xs">{cf.feature}</span>
                            <span className="text-emerald-500 font-mono text-xs font-bold">-{Math.abs(cf.expectedScoreChange)} pts</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                            <span className="line-through opacity-70">{cf.currentValue}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-foreground font-medium">{cf.targetValue}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-2">{cf.description}</p>
                        </div>
                      </div>
                    ))}
                    {(!counterfactuals || counterfactuals.length === 0) && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                        <ShieldCheck className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No actionable mitigations found for this supplier.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
