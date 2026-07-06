import { Router } from "express";

const router = Router();

const SEARCH_CORPUS = [
  { id: "s-001", type: "supplier", title: "Siemens AG", snippet: "German industrial conglomerate. Low risk (12.4). Excellent on-time delivery (98.1%). Category: Industrial Automation.", metadata: { country: "Germany", riskLevel: "low", category: "Industrial" } },
  { id: "s-002", type: "supplier", title: "Samsung Electronics", snippet: "South Korean electronics manufacturer. Medium-low risk (32.1). Strong payment history. Key supplier for PCB assemblies.", metadata: { country: "South Korea", riskLevel: "low", category: "Electronics" } },
  { id: "s-003", type: "supplier", title: "Foxconn", snippet: "Taiwanese electronics contract manufacturer. High risk (78.4) due to labor disputes and concentration risk in China.", metadata: { country: "China", riskLevel: "high", category: "Manufacturing" } },
  { id: "s-004", type: "supplier", title: "BASF SE", snippet: "German multinational chemical company. Low risk (18.7). Strong ESG credentials. Expanding sustainable portfolio.", metadata: { country: "Germany", riskLevel: "low", category: "Chemicals" } },
  { id: "s-008", type: "supplier", title: "Infosys", snippet: "Indian IT services and consulting. Low risk (22.3). Excellent SLA adherence. Strong data security posture.", metadata: { country: "India", riskLevel: "low", category: "IT Services" } },
  { id: "s-013", type: "supplier", title: "Vale SA", snippet: "Brazilian mining company. High risk (71.2) due to port strike disruptions and ESG violations.", metadata: { country: "Brazil", riskLevel: "high", category: "Mining" } },
  { id: "c-001", type: "contract", title: "Samsung Electronics MSA 2024", snippet: "Master Supply Agreement for PCB assemblies. Value: ₹373Cr. Active. Expires Jan 2026. Risk score: 22.", metadata: { value: 45000000, status: "active" } },
  { id: "c-002", type: "contract", title: "Foxconn Manufacturing Agreement", snippet: "High-volume contract manufacturing deal. Value: ₹1,062Cr. Under review due to high supplier risk score.", metadata: { value: 128000000, status: "under_review" } },
  { id: "n-004", type: "news", title: "Vale Iron Ore Shipments Disrupted by Brazilian Port Strike", snippet: "Dockworkers at Tubarão port entered day 3 of strike action, halting approximately 18Mt of annual export capacity.", metadata: { sentiment: "negative", impactLevel: "high" } },
  { id: "n-006", type: "news", title: "Geopolitical Risk Index Rises as Taiwan Strait Tensions Escalate", snippet: "Advanced chip supply disruption risk within 90 days of any escalation scenario.", metadata: { sentiment: "negative", impactLevel: "high" } },
];

router.post("/search/semantic", (req, res) => {
  const { query, limit = 10 } = req.body as { query: string; limit?: number };
  const q = (query ?? "").toLowerCase();

  const keywords = q.split(/\s+/).filter(Boolean);
  const results = SEARCH_CORPUS
    .map(item => {
      const text = `${item.title} ${item.snippet} ${JSON.stringify(item.metadata)}`.toLowerCase();
      const matchCount = keywords.filter(k => text.includes(k)).length;
      const score = matchCount / (keywords.length || 1) * 0.7 + Math.random() * 0.3;
      return { ...item, score: Math.round(score * 1000) / 1000 };
    })
    .filter(r => r.score > 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(limit));

  res.json(results.length ? results : SEARCH_CORPUS.slice(0, 4).map(r => ({ ...r, score: 0.5 })));
});

router.get("/search/suggestions", (req, res) => {
  const { q } = req.query as { q: string };
  const suggestions = [
    "electronics suppliers in Asia with less than 5% delivery delay",
    "high risk suppliers expiring contracts",
    "chemical suppliers with ESG score above 70",
    "logistics partners with on-time delivery above 95%",
    "semiconductor suppliers in Taiwan",
    "suppliers under fraud investigation",
    "contracts expiring in next 90 days",
    "low cost IT services suppliers India",
  ].filter(s => s.toLowerCase().includes((q ?? "").toLowerCase())).slice(0, 5);
  res.json(suggestions);
});

export default router;
