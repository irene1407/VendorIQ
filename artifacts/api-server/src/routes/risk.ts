import { Router } from "express";

const router = Router();

const RISK_SCORES = [
  { supplierId: "s-003", supplierName: "Foxconn", score: 78.4, riskLevel: "high", confidence: 0.91, updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { supplierId: "s-013", supplierName: "Vale SA", score: 71.2, riskLevel: "high", confidence: 0.87, updatedAt: new Date(Date.now() - 7200000).toISOString() },
  { supplierId: "s-014", supplierName: "Alibaba Cloud", score: 64.7, riskLevel: "medium", confidence: 0.84, updatedAt: new Date(Date.now() - 1800000).toISOString() },
  { supplierId: "s-015", supplierName: "Evergrande Logistics", score: 88.3, riskLevel: "critical", confidence: 0.96, updatedAt: new Date().toISOString() },
  { supplierId: "s-002", supplierName: "Samsung Electronics", score: 32.1, riskLevel: "low", confidence: 0.93, updatedAt: new Date(Date.now() - 14400000).toISOString() },
  { supplierId: "s-001", supplierName: "Siemens AG", score: 12.4, riskLevel: "low", confidence: 0.98, updatedAt: new Date(Date.now() - 10800000).toISOString() },
  { supplierId: "s-004", supplierName: "BASF SE", score: 18.7, riskLevel: "low", confidence: 0.95, updatedAt: new Date(Date.now() - 9000000).toISOString() },
  { supplierId: "s-016", supplierName: "Petrobras", score: 55.8, riskLevel: "medium", confidence: 0.82, updatedAt: new Date(Date.now() - 5400000).toISOString() },
];

router.get("/risk/scores", (req, res) => {
  let scores = [...RISK_SCORES];
  const { minScore, riskLevel } = req.query;
  if (minScore) scores = scores.filter(s => s.score >= Number(minScore));
  if (riskLevel) scores = scores.filter(s => s.riskLevel === riskLevel);
  res.json(scores);
});

router.get("/risk/explain/:supplierId", (req, res) => {
  const { supplierId } = req.params;
  const score = RISK_SCORES.find(s => s.supplierId === supplierId) ?? RISK_SCORES[0];
  res.json({
    supplierId: score.supplierId,
    supplierName: score.supplierName,
    score: score.score,
    riskLevel: score.riskLevel,
    baseValue: 45.0,
    confidence: score.confidence ?? 0.88,
    shapValues: [
      { feature: "Payment History", value: 0.72, shapValue: 18.4, direction: "increases_risk", description: "3 late payments in past 6 months" },
      { feature: "Geopolitical Stability", value: 0.31, shapValue: 14.2, direction: "increases_risk", description: "Country risk score elevated" },
      { feature: "Financial Health Score", value: 0.58, shapValue: -8.3, direction: "decreases_risk", description: "Stable revenue YoY" },
      { feature: "Delivery Performance", value: 0.89, shapValue: -12.1, direction: "decreases_risk", description: "High on-time delivery rate" },
      { feature: "Concentration Risk", value: 0.67, shapValue: 9.7, direction: "increases_risk", description: "Single-source for 3 critical components" },
      { feature: "ESG Score", value: 0.44, shapValue: 5.2, direction: "increases_risk", description: "Below-average ESG rating" },
      { feature: "Contract Compliance", value: 0.91, shapValue: -6.8, direction: "decreases_risk", description: "Full compliance last 12 months" },
      { feature: "News Sentiment", value: -0.23, shapValue: 7.1, direction: "increases_risk", description: "Negative coverage in past 30 days" },
    ],
    featureImportance: [
      { feature: "Payment History", importance: 0.28 },
      { feature: "Geopolitical Stability", importance: 0.21 },
      { feature: "Delivery Performance", importance: 0.18 },
      { feature: "Financial Health Score", importance: 0.13 },
      { feature: "Concentration Risk", importance: 0.09 },
      { feature: "ESG Score", importance: 0.06 },
      { feature: "Contract Compliance", importance: 0.03 },
      { feature: "News Sentiment", importance: 0.02 },
    ],
  });
});

router.get("/risk/counterfactuals/:supplierId", (req, res) => {
  res.json([
    {
      feature: "Payment History",
      currentValue: 0.72,
      targetValue: 0.95,
      expectedScoreChange: -18.4,
      difficulty: "moderate",
      description: "Resolve outstanding invoices and establish automated payment schedule",
    },
    {
      feature: "Concentration Risk",
      currentValue: 0.67,
      targetValue: 0.40,
      expectedScoreChange: -9.7,
      difficulty: "hard",
      description: "Qualify alternative sources for the 3 single-sourced components",
    },
    {
      feature: "ESG Score",
      currentValue: 0.44,
      targetValue: 0.70,
      expectedScoreChange: -5.2,
      difficulty: "moderate",
      description: "Complete ISO 14001 certification and publish annual sustainability report",
    },
    {
      feature: "News Sentiment",
      currentValue: -0.23,
      targetValue: 0.10,
      expectedScoreChange: -7.1,
      difficulty: "easy",
      description: "Issue public statement addressing recent media coverage concerns",
    },
  ]);
});

export default router;
