import { useGetDashboardSummary, useGetSpendTrends, useGetSupplierLeaderboard, useGetRiskHeatmap } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { Users, ShieldAlert, TrendingDown, DollarSign, Activity, Truck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function AnimatedCounter({ value, prefix = "", suffix = "", formatter = (v: number) => v.toString() }: { value: number, prefix?: string, suffix?: string, formatter?: (v: number) => string }) {
  // Simplistic animation approach for demonstration
  return <span>{prefix}{formatter(value)}{suffix}</span>;
}

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: trends, isLoading: isTrendsLoading } = useGetSpendTrends({ months: 6 });
  const { data: leaderboard, isLoading: isLeaderboardLoading } = useGetSupplierLeaderboard({ limit: 5 });
  const { data: heatmap, isLoading: isHeatmapLoading } = useGetRiskHeatmap();

  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapRef.current || !heatmap || heatmap.length === 0) return;
    
    // Quick leaflet map init
    const map = L.map(mapRef.current).setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    heatmap.forEach(point => {
      const color = point.riskScore > 75 ? '#dc2626' : point.riskScore > 50 ? '#f59e0b' : '#10b981';
      L.circleMarker([point.lat, point.lon], {
        radius: Math.max(5, point.supplierCount * 2),
        fillColor: color,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map).bindPopup(`${point.country}: ${point.supplierCount} suppliers<br>Avg Risk: ${point.riskScore.toFixed(1)}`);
    });

    return () => {
      map.remove();
    };
  }, [heatmap]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Executive Command Center</h1>
        <p className="text-muted-foreground">Global procurement overview, real-time risk, and AI-driven intelligence.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spend (YTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold font-display">{formatCurrency(summary?.totalSpend || 0)}</div>
                <p className="text-xs text-emerald-400 mt-1 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {summary?.totalSpendChange}% vs last year
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold font-display">{summary?.activeSuppliers}</div>
                <p className="text-xs text-muted-foreground mt-1">Across 42 countries</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Risk Entities</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold font-display text-destructive">{summary?.highRiskSuppliers}</div>
                <p className="text-xs text-muted-foreground mt-1">Requires immediate review</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Predicted Savings</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold font-display text-primary">{formatCurrency(summary?.predictedSavings || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Identified by AI agents</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle>Spend vs Budget Forecast</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {isTrendsLoading ? (
              <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-md ml-4" />
            ) : (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${(value / 1_00_00_000).toFixed(0)}Cr`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="budget" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorBudget)" />
                    <Area type="monotone" dataKey="spend" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSpend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle>Global Risk Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            {isHeatmapLoading ? (
              <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-md" />
            ) : (
              <div className="h-[300px] w-full rounded-md overflow-hidden border border-border/20 relative">
                <div ref={mapRef} className="absolute inset-0 z-0 bg-[#0a0a0a]" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle>Top Performing Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLeaderboardLoading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted/20 animate-pulse rounded-md" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard?.map((supplier, i) => (
                  <div key={supplier.supplierId} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/5 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                        #{supplier.rank}
                      </div>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{supplier.category}</span>
                          <span>•</span>
                          <span>{supplier.country}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-display font-bold text-primary">{supplier.score}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card/50 backdrop-blur border-border/10">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-destructive/0 via-destructive/5 to-destructive/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-destructive">Anomaly Detected</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unusual invoice velocity from TechLogistics Inc. 340% increase over 30-day baseline.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex gap-3">
                  <TrendingDown className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-primary">Price Opportunity</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Silicon Wafer commodity futures indicate a 12% price drop in Q3. Delay bulk orders.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex gap-3">
                  <ShieldAlert className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-emerald-500">Risk Mitigated</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Alternative supplier found for constrained European routes. Projected savings: ₹3.5Cr.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
