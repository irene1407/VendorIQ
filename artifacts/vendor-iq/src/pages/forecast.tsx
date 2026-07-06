import { useListCommodityForecasts, useGetCommodityForecast } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useState } from "react";

export default function Forecast() {
  const { data: commodities, isLoading: isCommoditiesLoading } = useListCommodityForecasts();
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null);

  const activeCommodity = selectedCommodity || (commodities && commodities.length > 0 ? commodities[0].commodity : 'Aluminum');

  const { data: forecast, isLoading: isForecastLoading } = useGetCommodityForecast(activeCommodity, { query: { enabled: !!activeCommodity } });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-destructive" />; // Up is bad for buying
      case 'down': return <TrendingDown className="h-4 w-4 text-emerald-500" />; // Down is good for buying
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-destructive';
      case 'down': return 'text-emerald-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Price Intelligence</h1>
        <p className="text-muted-foreground">ML-driven commodity price forecasting with confidence intervals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isCommoditiesLoading ? (
          Array(4).fill(0).map((_, i) => <Card key={i} className="h-32 bg-muted/20 animate-pulse border-border/10" />)
        ) : (
          commodities?.slice(0, 4).map(c => (
            <Card 
              key={c.commodity} 
              className={`bg-card/50 backdrop-blur cursor-pointer transition-colors ${activeCommodity === c.commodity ? 'border-primary' : 'border-border/10 hover:border-primary/50'}`}
              onClick={() => setSelectedCommodity(c.commodity)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{c.commodity}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Confidence: {formatPercent(c.confidence * 100)}</div>
                  </div>
                  {getTrendIcon(c.trend)}
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <div className="text-2xl font-bold font-display">{formatCurrency(c.forecastPrice)}</div>
                  <div className={`text-xs font-medium ${getTrendColor(c.trend)}`}>
                    {c.change > 0 ? '+' : ''}{c.changePercent}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10 h-[500px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/10">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {activeCommodity} Forecast Model
            </CardTitle>
            <CardDescription>Historical actuals and 90-day predictive bands</CardDescription>
          </div>
          <Badge variant="outline" className="font-mono">{forecast?.unit || 'INR/Unit'}</Badge>
        </CardHeader>
        <CardContent className="flex-1 p-6">
          {isForecastLoading ? (
            <div className="w-full h-full bg-muted/20 animate-pulse rounded-md" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast?.points} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })} 
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                
                {/* Confidence Interval Band */}
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
                
                {/* Actuals Line */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--foreground))" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: 'hsl(var(--foreground))' }} 
                  activeDot={{ r: 6 }} 
                  name="Historical Actual"
                />
                
                {/* Forecast Line */}
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
