import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Loader2,
  Newspaper,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type NewsItem = {
  id: string;
  title: string;
  source: string;
  summary: string;
  sentiment: "positive" | "neutral" | "negative" | string;
  sentimentScore: number;
  tags: string[];
  supplierId: string | null;
  supplierName: string | null;
  publishedAt: string;
  url: string;
  impactLevel: "low" | "medium" | "high" | string;
};

type NewsApiResponse = {
  value?: NewsItem[];
  Count?: number;
};

type TimelinePoint = {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
};

function normalizeNewsResponse(
  response: NewsApiResponse | NewsItem[] | null | undefined,
): NewsItem[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.value)) {
    return response.value;
  }

  return [];
}

function formatPublishedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPublishedTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSentimentBadgeClass(sentiment: string) {
  switch (sentiment.toLowerCase()) {
    case "positive":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

    case "negative":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    default:
      return "border-border/30 bg-muted/30 text-muted-foreground";
  }
}

function getImpactBadgeClass(impact: string) {
  switch (impact.toLowerCase()) {
    case "high":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    case "medium":
      return "border-amber-500/30 bg-amber-500/10 text-amber-400";

    default:
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }
}

function getSentimentIcon(sentiment: string) {
  switch (sentiment.toLowerCase()) {
    case "positive":
      return (
        <TrendingUp className="h-4 w-4 text-emerald-400" />
      );

    case "negative":
      return (
        <TrendingDown className="h-4 w-4 text-red-400" />
      );

    default:
      return (
        <Minus className="h-4 w-4 text-muted-foreground" />
      );
  }
}

function buildTimeline(news: NewsItem[]): TimelinePoint[] {
  const grouped = new Map<
    string,
    {
      positive: number;
      neutral: number;
      negative: number;
    }
  >();

  for (const article of news) {
    const date = new Date(article.publishedAt);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const key = date.toISOString().slice(0, 10);

    if (!grouped.has(key)) {
      grouped.set(key, {
        positive: 0,
        neutral: 0,
        negative: 0,
      });
    }

    const entry = grouped.get(key);

    if (!entry) {
      continue;
    }

    switch (article.sentiment.toLowerCase()) {
      case "positive":
        entry.positive += 1;
        break;

      case "negative":
        entry.negative += 1;
        break;

      default:
        entry.neutral += 1;
        break;
    }
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      ...values,
    }));
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(
        "http://localhost:5000/api/news?limit=10",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `News API returned HTTP ${response.status}`,
        );
      }

      const data =
        (await response.json()) as NewsApiResponse | NewsItem[];

      const normalizedNews = normalizeNewsResponse(data);

      setNews(normalizedNews);
    } catch (fetchError) {
      console.error("Failed to fetch market news:", fetchError);

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load market news.",
      );

      setNews([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  const timeline = useMemo(
    () => buildTimeline(news),
    [news],
  );

  const sentimentSummary = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    for (const article of news) {
      switch (article.sentiment.toLowerCase()) {
        case "positive":
          positive += 1;
          break;

        case "negative":
          negative += 1;
          break;

        default:
          neutral += 1;
          break;
      }
    }

    return {
      positive,
      neutral,
      negative,
    };
  }, [news]);

  const averageSentiment = useMemo(() => {
    if (news.length === 0) {
      return 0;
    }

    const total = news.reduce(
      (sum, article) =>
        sum +
        (Number.isFinite(article.sentimentScore)
          ? article.sentimentScore
          : 0),
      0,
    );

    return total / news.length;
  }, [news]);

  const highImpactCount = useMemo(
    () =>
      news.filter(
        (article) =>
          article.impactLevel.toLowerCase() === "high",
      ).length,
    [news],
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchNews();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Market Intelligence
          </h1>

          <p className="text-muted-foreground mt-1">
            Real-time NLP sentiment analysis on global news
            affecting your supply chain.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-fit"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}

          Refresh News
        </Button>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />

            <div>
              <div className="font-medium text-red-400">
                Unable to load market news
              </div>

              <div className="text-sm text-muted-foreground mt-1">
                {error}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardDescription>
              Articles analysed
            </CardDescription>

            <CardTitle className="text-2xl font-display">
              {isLoading ? "..." : news.length}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xs text-muted-foreground">
              Procurement-relevant news
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardDescription>
              Average sentiment
            </CardDescription>

            <CardTitle
              className={`text-2xl font-display ${
                averageSentiment > 0.1
                  ? "text-emerald-400"
                  : averageSentiment < -0.1
                    ? "text-red-400"
                    : "text-muted-foreground"
              }`}
            >
              {isLoading
                ? "..."
                : `${averageSentiment >= 0 ? "+" : ""}${averageSentiment.toFixed(2)}`}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xs text-muted-foreground">
              NLP sentiment score
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardDescription>
              Negative coverage
            </CardDescription>

            <CardTitle className="text-2xl font-display text-red-400">
              {isLoading
                ? "..."
                : sentimentSummary.negative}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xs text-muted-foreground">
              Articles requiring attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/10">
          <CardHeader className="pb-2">
            <CardDescription>
              High impact
            </CardDescription>

            <CardTitle className="text-2xl font-display text-amber-400">
              {isLoading ? "..." : highImpactCount}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-xs text-muted-foreground">
              Supply-chain relevant events
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <CardHeader>
          <CardTitle>
            Global Sentiment Timeline
          </CardTitle>

          <CardDescription>
            Distribution of positive, neutral, and negative
            market coverage across the returned news.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="h-[280px] rounded-lg bg-muted/20 animate-pulse" />
          ) : timeline.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No sentiment timeline data available.
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={timeline}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
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
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                        },
                      )
                    }
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="hsl(var(--muted-foreground))"
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
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    }
                  />

                  <Bar
                    dataKey="positive"
                    name="Positive"
                    stackId="sentiment"
                    fill="hsl(142 71% 45%)"
                  />

                  <Bar
                    dataKey="neutral"
                    name="Neutral"
                    stackId="sentiment"
                    fill="hsl(215 16% 55%)"
                  />

                  <Bar
                    dataKey="negative"
                    name="Negative"
                    stackId="sentiment"
                    fill="hsl(0 72% 55%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Market News
          </CardTitle>

          <CardDescription>
            Latest procurement, supply-chain, logistics,
            manufacturing, and semiconductor coverage.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-lg bg-muted/20 animate-pulse"
                />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="py-16 text-center">
              <Newspaper className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />

              <p className="text-muted-foreground">
                No market news available.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((article) => (
                <article
                  key={article.id}
                  className="rounded-xl border border-border/10 bg-background/40 p-5 transition-colors hover:border-primary/30"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getSentimentIcon(
                            article.sentiment,
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-base leading-snug">
                            {article.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>
                              {article.source}
                            </span>

                            <span>•</span>

                            <span>
                              {formatPublishedDate(
                                article.publishedAt,
                              )}
                            </span>

                            <span>
                              {formatPublishedTime(
                                article.publishedAt,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <Badge
                          variant="outline"
                          className={getSentimentBadgeClass(
                            article.sentiment,
                          )}
                        >
                          {article.sentiment
                            .charAt(0)
                            .toUpperCase() +
                            article.sentiment.slice(1)}
                        </Badge>

                        <Badge
                          variant="outline"
                          className={getImpactBadgeClass(
                            article.impactLevel,
                          )}
                        >
                          {article.impactLevel
                            .charAt(0)
                            .toUpperCase() +
                            article.impactLevel.slice(1)}{" "}
                          Impact
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {article.summary}
                    </p>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag.replace(/_/g, " ")}
                          </Badge>
                        ))}

                        {article.supplierName && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            Supplier:{" "}
                            {article.supplierName}
                          </Badge>
                        )}
                      </div>

                      {article.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Read source
                            <ExternalLink className="h-3.5 w-3.5 ml-2" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}