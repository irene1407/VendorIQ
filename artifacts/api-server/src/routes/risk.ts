import { Router } from "express";

const router = Router();

const ML_API_URL = process.env.ML_API_URL ?? "http://127.0.0.1:8000";

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

const SUPPLIER_FEATURES: Record<string, Record<string, number>> = {
  "s-003": {
    revenue_growth: 0.02,
    debt_to_equity: 2.1,
    profit_margin: 0.06,
    cash_flow_ratio: 0.9,
    delivery_delay_rate: 0.18,
    defect_rate: 0.08,
    capacity_utilization: 0.91,
    lead_time_variability: 0.22,
    compliance_score: 0.72,
    certification_count: 2,
    regulatory_violations: 2,
    security_incidents: 3,
    data_breaches: 1,
    security_score: 0.61,
    customer_complaints: 12,
    negative_news_count: 5,
    sentiment_score: -0.25,
    country_risk_score: 0.55,
    geopolitical_exposure: 0.48,
  },
  "s-013": {
    revenue_growth: 0.01,
    debt_to_equity: 1.9,
    profit_margin: 0.08,
    cash_flow_ratio: 1.0,
    delivery_delay_rate: 0.15,
    defect_rate: 0.06,
    capacity_utilization: 0.88,
    lead_time_variability: 0.2,
    compliance_score: 0.76,
    certification_count: 3,
    regulatory_violations: 1,
    security_incidents: 2,
    data_breaches: 0,
    security_score: 0.68,
    customer_complaints: 9,
    negative_news_count: 4,
    sentiment_score: -0.18,
    country_risk_score: 0.58,
    geopolitical_exposure: 0.52,
  },
  "s-014": {
    revenue_growth: 0.04,
    debt_to_equity: 1.5,
    profit_margin: 0.1,
    cash_flow_ratio: 1.2,
    delivery_delay_rate: 0.1,
    defect_rate: 0.04,
    capacity_utilization: 0.82,
    lead_time_variability: 0.15,
    compliance_score: 0.82,
    certification_count: 4,
    regulatory_violations: 1,
    security_incidents: 2,
    data_breaches: 1,
    security_score: 0.74,
    customer_complaints: 6,
    negative_news_count: 3,
    sentiment_score: -0.05,
    country_risk_score: 0.4,
    geopolitical_exposure: 0.35,
  },
  "s-015": {
    revenue_growth: -0.04,
    debt_to_equity: 3.2,
    profit_margin: 0.02,
    cash_flow_ratio: 0.65,
    delivery_delay_rate: 0.24,
    defect_rate: 0.1,
    capacity_utilization: 0.95,
    lead_time_variability: 0.3,
    compliance_score: 0.6,
    certification_count: 1,
    regulatory_violations: 4,
    security_incidents: 4,
    data_breaches: 2,
    security_score: 0.48,
    customer_complaints: 18,
    negative_news_count: 8,
    sentiment_score: -0.4,
    country_risk_score: 0.7,
    geopolitical_exposure: 0.65,
  },
  "s-002": {
    revenue_growth: 0.08,
    debt_to_equity: 1.2,
    profit_margin: 0.12,
    cash_flow_ratio: 1.5,
    delivery_delay_rate: 0.08,
    defect_rate: 0.03,
    capacity_utilization: 0.75,
    lead_time_variability: 0.12,
    compliance_score: 0.9,
    certification_count: 4,
    regulatory_violations: 0,
    security_incidents: 1,
    data_breaches: 0,
    security_score: 0.85,
    customer_complaints: 3,
    negative_news_count: 1,
    sentiment_score: 0.7,
    country_risk_score: 0.2,
    geopolitical_exposure: 0.15,
  },
  "s-001": {
    revenue_growth: 0.1,
    debt_to_equity: 0.8,
    profit_margin: 0.15,
    cash_flow_ratio: 1.7,
    delivery_delay_rate: 0.03,
    defect_rate: 0.01,
    capacity_utilization: 0.7,
    lead_time_variability: 0.08,
    compliance_score: 0.96,
    certification_count: 6,
    regulatory_violations: 0,
    security_incidents: 0,
    data_breaches: 0,
    security_score: 0.95,
    customer_complaints: 1,
    negative_news_count: 0,
    sentiment_score: 0.85,
    country_risk_score: 0.1,
    geopolitical_exposure: 0.08,
  },
  "s-004": {
    revenue_growth: 0.07,
    debt_to_equity: 1.0,
    profit_margin: 0.14,
    cash_flow_ratio: 1.55,
    delivery_delay_rate: 0.04,
    defect_rate: 0.02,
    capacity_utilization: 0.73,
    lead_time_variability: 0.1,
    compliance_score: 0.94,
    certification_count: 5,
    regulatory_violations: 0,
    security_incidents: 1,
    data_breaches: 0,
    security_score: 0.9,
    customer_complaints: 2,
    negative_news_count: 0,
    sentiment_score: 0.8,
    country_risk_score: 0.12,
    geopolitical_exposure: 0.1,
  },
  "s-016": {
    revenue_growth: 0.03,
    debt_to_equity: 1.7,
    profit_margin: 0.09,
    cash_flow_ratio: 1.1,
    delivery_delay_rate: 0.12,
    defect_rate: 0.05,
    capacity_utilization: 0.86,
    lead_time_variability: 0.18,
    compliance_score: 0.8,
    certification_count: 3,
    regulatory_violations: 1,
    security_incidents: 2,
    data_breaches: 0,
    security_score: 0.7,
    customer_complaints: 8,
    negative_news_count: 3,
    sentiment_score: 0.05,
    country_risk_score: 0.45,
    geopolitical_exposure: 0.4,
  },
};

router.get("/risk/scores", async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  
  try {
    const { minScore, riskLevel } = req.query;

    const predictions = await Promise.all(
      RISK_SCORES.map(async (supplier) => {
        const features = SUPPLIER_FEATURES[supplier.supplierId];

        if (!features) {
          return supplier;
        }

        const response = await fetch(`${ML_API_URL}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendor_id: supplier.supplierId,
            ...features,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `ML API returned ${response.status} for ${supplier.supplierId}`,
          );
        }

        const prediction = (await response.json()) as {
          vendor_id: string;
          risk_category: string;
          risk_label: number;
          risk_probability: number;
          decision_threshold: number;
        };

        return {
          supplierId: supplier.supplierId,
          supplierName: supplier.supplierName,
          score: Number((prediction.risk_probability * 100).toFixed(1)),
          riskLevel: String(prediction.risk_category).toLowerCase(),
          confidence: Number(
            Math.max(
              prediction.risk_probability,
              1 - prediction.risk_probability,
            ).toFixed(2),
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    );

    let scores = predictions;

    if (minScore) {
      scores = scores.filter(
        (supplier) => supplier.score >= Number(minScore),
      );
    }

    if (riskLevel) {
      scores = scores.filter(
        (supplier) => supplier.riskLevel === riskLevel,
      );
    }

    res.json(scores);
  } catch (error) {
    console.error("Risk ML prediction failed:", error);

    res.status(502).json({
      error: "Unable to retrieve risk predictions from the ML service.",
    });
  }
});

router.get("/risk/explain/:supplierId", (req, res) => {
  const { supplierId } = req.params;
  const score =
    RISK_SCORES.find((s) => s.supplierId === supplierId) ?? RISK_SCORES[0];

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