import { useListNews, useGetNewsTimeline } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { ExternalLink, TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function News() {
  const { data: news, isLoading: isNewsLoading } = useListNews({ limit: 20 });
  const { data: timeline, isLoading: isTimelineLoading } = useGetNewsTimeline({ days: 30 });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Market Intelligence</h1>
        <p className="text-muted-foreground">Real-time NLP sentiment analysis on global news affecting your supply chain.</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <CardHeader>
          <CardTitle>Global Sentiment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {isTimelineLoading ? (
            <div className="h-[200px] w-full bg-muted/20 animate-pulse rounded-md" />
          ) : (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="avgSentiment" stroke="hsl(var(--primary))" fill="url(#colorSentiment)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isNewsLoading ? (
           Array(6).fill(0).map((_, i) => <Card key={i} className="h-48 bg-muted/20 animate-pulse border-border/10" />)
        ) : (
          news?.map(article => (
            <Card key={article.id} className="bg-card/50 backdrop-blur border-border/10 flex flex-col hover:border-primary/50 transition-colors group cursor-pointer">
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono text-muted-foreground">{article.source}</span>
                  <Badge variant={article.sentiment === 'negative' ? 'destructive' : article.sentiment === 'positive' ? 'success' : 'outline'} className="text-[10px] uppercase">
                    {article.sentiment}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                  {article.summary}
                </p>
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-border/10">
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                  {article.supplierName && (
                    <Badge variant="secondary" className="text-[10px] max-w-[120px] truncate block">
                      {article.supplierName}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
