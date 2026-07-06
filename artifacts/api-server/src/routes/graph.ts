import { Router } from "express";

const router = Router();

const GRAPH_DATA = {
  nodes: [
    { id: "sup-1", type: "supplier", label: "Samsung Electronics", riskScore: 32.1, metadata: { country: "South Korea", category: "Electronics" } },
    { id: "sup-2", type: "supplier", label: "Foxconn", riskScore: 78.4, metadata: { country: "China", category: "Manufacturing" } },
    { id: "sup-3", type: "supplier", label: "TSMC", riskScore: 44.8, metadata: { country: "Taiwan", category: "Semiconductors" } },
    { id: "sup-4", type: "supplier", label: "BASF SE", riskScore: 18.7, metadata: { country: "Germany", category: "Chemicals" } },
    { id: "sup-5", type: "supplier", label: "Vale SA", riskScore: 71.2, metadata: { country: "Brazil", category: "Mining" } },
    { id: "sup-6", type: "supplier", label: "Siemens AG", riskScore: 12.4, metadata: { country: "Germany", category: "Industrial" } },
    { id: "prod-1", type: "product", label: "Silicon Wafers", riskScore: null, metadata: { category: "Semiconductors" } },
    { id: "prod-2", type: "product", label: "PCB Assemblies", riskScore: null, metadata: { category: "Electronics" } },
    { id: "prod-3", type: "product", label: "Lithium Carbonate", riskScore: null, metadata: { category: "Chemicals" } },
    { id: "prod-4", type: "product", label: "Iron Ore", riskScore: null, metadata: { category: "Mining" } },
    { id: "ctry-1", type: "country", label: "China", riskScore: 72.3, metadata: { suppliers: 58 } },
    { id: "ctry-2", type: "country", label: "Taiwan", riskScore: 68.1, metadata: { suppliers: 14 } },
    { id: "ctry-3", type: "country", label: "Germany", riskScore: 18.4, metadata: { suppliers: 27 } },
    { id: "ctry-4", type: "country", label: "Brazil", riskScore: 55.7, metadata: { suppliers: 12 } },
    { id: "risk-1", type: "risk_factor", label: "Geopolitical Tension", riskScore: 82.0, metadata: { region: "Asia-Pacific" } },
    { id: "risk-2", type: "risk_factor", label: "Supply Chain Disruption", riskScore: 68.0, metadata: { region: "Global" } },
    { id: "risk-3", type: "risk_factor", label: "ESG Non-Compliance", riskScore: 55.0, metadata: {} },
    { id: "news-1", type: "news_event", label: "Taiwan Strait Tensions", riskScore: null, metadata: { sentiment: "negative", date: "2024-10-15" } },
    { id: "news-2", type: "news_event", label: "EU Carbon Border Adjustment", riskScore: null, metadata: { sentiment: "neutral", date: "2024-11-01" } },
    { id: "con-1", type: "contract", label: "Samsung Supply MSA", riskScore: 22.0, metadata: { value: 45000000, status: "active" } },
    { id: "con-2", type: "contract", label: "Foxconn Manufacturing", riskScore: 67.0, metadata: { value: 128000000, status: "under_review" } },
  ],
  edges: [
    { id: "e-1", source: "sup-1", target: "prod-1", type: "supplies", weight: 0.9, label: "Primary supplier" },
    { id: "e-2", source: "sup-1", target: "prod-2", type: "supplies", weight: 0.6, label: null },
    { id: "e-3", source: "sup-2", target: "prod-2", type: "supplies", weight: 0.95, label: "Contract manufacturer" },
    { id: "e-4", source: "sup-3", target: "prod-1", type: "supplies", weight: 0.85, label: null },
    { id: "e-5", source: "sup-4", target: "prod-3", type: "supplies", weight: 0.7, label: null },
    { id: "e-6", source: "sup-5", target: "prod-4", type: "supplies", weight: 0.9, label: null },
    { id: "e-7", source: "sup-1", target: "ctry-2", type: "located_in", weight: 1.0, label: null },
    { id: "e-8", source: "sup-2", target: "ctry-1", type: "located_in", weight: 1.0, label: null },
    { id: "e-9", source: "sup-3", target: "ctry-2", type: "located_in", weight: 1.0, label: null },
    { id: "e-10", source: "sup-4", target: "ctry-3", type: "located_in", weight: 1.0, label: null },
    { id: "e-11", source: "sup-5", target: "ctry-4", type: "located_in", weight: 1.0, label: null },
    { id: "e-12", source: "ctry-2", target: "risk-1", type: "exposed_to", weight: 0.8, label: null },
    { id: "e-13", source: "ctry-1", target: "risk-1", type: "exposed_to", weight: 0.9, label: null },
    { id: "e-14", source: "sup-2", target: "risk-3", type: "flagged_for", weight: 0.6, label: null },
    { id: "e-15", source: "risk-1", target: "news-1", type: "related_to", weight: 0.95, label: null },
    { id: "e-16", source: "ctry-3", target: "news-2", type: "affected_by", weight: 0.7, label: null },
    { id: "e-17", source: "sup-1", target: "con-1", type: "under_contract", weight: 1.0, label: null },
    { id: "e-18", source: "sup-2", target: "con-2", type: "under_contract", weight: 1.0, label: null },
    { id: "e-19", source: "risk-2", target: "prod-1", type: "threatens", weight: 0.7, label: null },
    { id: "e-20", source: "sup-1", target: "sup-3", type: "competes_with", weight: 0.5, label: "Alternative" },
  ],
};

router.get("/graph", (_req, res) => {
  res.json(GRAPH_DATA);
});

router.get("/graph/neighbors/:nodeId", (req, res) => {
  const { nodeId } = req.params;
  const neighborIds = new Set<string>();
  const neighborEdges = GRAPH_DATA.edges.filter(e => {
    if (e.source === nodeId) { neighborIds.add(e.target); return true; }
    if (e.target === nodeId) { neighborIds.add(e.source); return true; }
    return false;
  });
  const nodes = GRAPH_DATA.nodes.filter(n => neighborIds.has(n.id) || n.id === nodeId);
  res.json({ nodes, edges: neighborEdges });
});

export default router;
