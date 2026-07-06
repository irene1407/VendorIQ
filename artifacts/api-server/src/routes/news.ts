import { Router } from "express";

const router = Router();

const NEWS_ARTICLES = [
  {
    id: "n-001", title: "TSMC Reports Record Fab Utilization Amid AI Chip Demand Surge",
    source: "Bloomberg", summary: "TSMC's advanced nodes are running at 95%+ utilization as hyperscalers accelerate AI infrastructure buildout, raising concerns about lead times for non-AI customers.",
    sentiment: "positive", sentimentScore: 0.74, tags: ["semiconductors", "AI", "supply_chain"],
    supplierId: "s-003", supplierName: "TSMC", publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(), url: "https://example.com/tsmc-fab", impactLevel: "high",
  },
  {
    id: "n-002", title: "Foxconn Factory in Zhengzhou Faces Labor Protest Over Bonus Disputes",
    source: "Reuters", summary: "Approximately 200 workers staged a protest at the Zhengzhou iPhone assembly campus, disrupting production for an estimated 4-6 hours.",
    sentiment: "negative", sentimentScore: -0.68, tags: ["manufacturing", "labor", "China"],
    supplierId: "s-003", supplierName: "Foxconn", publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(), url: "https://example.com/foxconn-protest", impactLevel: "medium",
  },
  {
    id: "n-003", title: "BASF Expands Sustainable Chemistry Portfolio with €2B Investment",
    source: "Financial Times", summary: "BASF announced a major push into bio-based feedstocks, targeting 25% renewable raw materials by 2030.",
    sentiment: "positive", sentimentScore: 0.81, tags: ["chemicals", "ESG", "Germany"],
    supplierId: "s-004", supplierName: "BASF SE", publishedAt: new Date(Date.now() - 36 * 3600000).toISOString(), url: "https://example.com/basf-sustainable", impactLevel: "low",
  },
  {
    id: "n-004", title: "Vale Iron Ore Shipments Disrupted by Brazilian Port Strike",
    source: "Wall Street Journal", summary: "Dockworkers at Tubarão port entered day 3 of strike action, halting approximately 18Mt of annual export capacity.",
    sentiment: "negative", sentimentScore: -0.82, tags: ["mining", "logistics", "Brazil"],
    supplierId: "s-013", supplierName: "Vale SA", publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(), url: "https://example.com/vale-strike", impactLevel: "high",
  },
  {
    id: "n-005", title: "Siemens Wins €1.2B Smart Grid Contract Across 6 European Countries",
    source: "CNBC", summary: "The deal positions Siemens as the dominant grid automation supplier in EU's energy transition infrastructure program.",
    sentiment: "positive", sentimentScore: 0.88, tags: ["industrial", "energy", "Europe"],
    supplierId: "s-001", supplierName: "Siemens AG", publishedAt: new Date(Date.now() - 48 * 3600000).toISOString(), url: "https://example.com/siemens-grid", impactLevel: "low",
  },
  {
    id: "n-006", title: "Geopolitical Risk Index Rises as Taiwan Strait Tensions Escalate",
    source: "The Economist", summary: "Analysts warn that increased military exercises in the Taiwan Strait could disrupt 40% of global advanced chip supply within 90 days of any escalation.",
    sentiment: "negative", sentimentScore: -0.91, tags: ["geopolitical", "semiconductors", "risk"],
    supplierId: null, supplierName: null, publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(), url: "https://example.com/taiwan-risk", impactLevel: "high",
  },
  {
    id: "n-007", title: "Copper Prices Hit 18-Month High on Green Energy Demand",
    source: "Commodity Insights", summary: "LME copper broke through ₹7.8L/mt as EV and grid infrastructure buildout consumed inventory faster than mine output could compensate.",
    sentiment: "neutral", sentimentScore: 0.12, tags: ["commodities", "copper", "pricing"],
    supplierId: null, supplierName: null, publishedAt: new Date(Date.now() - 30 * 3600000).toISOString(), url: "https://example.com/copper-prices", impactLevel: "medium",
  },
  {
    id: "n-008", title: "EU Carbon Border Adjustment Mechanism Creates New Compliance Layer for Importers",
    source: "EurActiv", summary: "From January 2026, all imports of steel, aluminium, cement, and chemicals must carry embedded carbon certificates, affecting 34 of VendorIQ's active suppliers.",
    sentiment: "neutral", sentimentScore: -0.18, tags: ["ESG", "compliance", "EU"],
    supplierId: null, supplierName: null, publishedAt: new Date(Date.now() - 72 * 3600000).toISOString(), url: "https://example.com/eu-cbam", impactLevel: "high",
  },
];

router.get("/news", (req, res) => {
  let articles = [...NEWS_ARTICLES];
  const { sentiment, limit } = req.query;
  if (sentiment) articles = articles.filter(a => a.sentiment === sentiment);
  if (limit) articles = articles.slice(0, Number(limit));
  res.json(articles);
});

router.get("/news/supplier/:supplierId", (req, res) => {
  const { supplierId } = req.params;
  const articles = NEWS_ARTICLES.filter(a => a.supplierId === supplierId);
  res.json(articles.length ? articles : NEWS_ARTICLES.slice(0, 2));
});

router.get("/news/timeline", (_req, res) => {
  const today = Date.now();
  const DAY = 86400000;
  const timeline = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today - (29 - i) * DAY).toISOString().split("T")[0];
    const articles = Math.floor(Math.random() * 8) + 2;
    const avgSentiment = (Math.random() - 0.5) * 1.2;
    const majorEvents: Record<string, string> = {
      "2024-10-15": "Taiwan Strait escalation reports",
      "2024-11-01": "EU CBAM enforcement announced",
      "2024-11-08": "Foxconn labor dispute",
    };
    return { date, articles, avgSentiment: Math.round(avgSentiment * 100) / 100, majorEvent: majorEvents[date] ?? null };
  });
  res.json(timeline);
});

export default router;
