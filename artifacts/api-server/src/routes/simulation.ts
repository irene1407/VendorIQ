import { Router } from "express";

const router = Router();

router.post("/simulate", (req, res) => {
  const { supplierId, scenario } = req.body as {
    supplierId: string;
    scenario: { inflationDelta: number; shippingDelayDays: number; priceDelta: number; demandDelta: number };
  };

  const baseRisk = 45.0;
  const basePrice = 12_400;
  const baseFraud = 0.08;
  const baseRec = 0.72;

  const riskChange = scenario.inflationDelta * 1.8 + scenario.shippingDelayDays * 0.9 + Math.max(0, scenario.priceDelta) * 0.5;
  const priceChange = (scenario.inflationDelta / 100 + scenario.priceDelta / 100) * basePrice;
  const fraudChange = scenario.inflationDelta * 0.003 + Math.max(0, scenario.priceDelta) * 0.002;
  const recChange = -(riskChange * 0.003 + fraudChange * 0.5);

  const simRisk = Math.min(100, Math.max(0, baseRisk + riskChange));
  const simPrice = Math.max(0, basePrice + priceChange);
  const simFraud = Math.min(1, Math.max(0, baseFraud + fraudChange));
  const simRec = Math.min(1, Math.max(0, baseRec + recChange));

  res.json({
    supplierId,
    baseline: { riskScore: baseRisk, predictedPrice: basePrice, fraudProbability: baseFraud, recommendationScore: baseRec },
    simulated: {
      riskScore: Math.round(simRisk * 10) / 10,
      predictedPrice: Math.round(simPrice),
      fraudProbability: Math.round(simFraud * 1000) / 1000,
      recommendationScore: Math.round(simRec * 1000) / 1000,
    },
    changes: [
      { metric: "Risk Score", baseline: baseRisk, simulated: Math.round(simRisk * 10) / 10, delta: Math.round(riskChange * 10) / 10, direction: riskChange > 0 ? "worse" : riskChange < 0 ? "better" : "neutral" },
      { metric: "Predicted Price (INR)", baseline: basePrice, simulated: Math.round(simPrice), delta: Math.round(priceChange), direction: priceChange > 0 ? "worse" : "better" },
      { metric: "Fraud Probability", baseline: baseFraud, simulated: Math.round(simFraud * 1000) / 1000, delta: Math.round(fraudChange * 1000) / 1000, direction: fraudChange > 0 ? "worse" : "better" },
      { metric: "Recommendation Score", baseline: baseRec, simulated: Math.round(simRec * 1000) / 1000, delta: Math.round(recChange * 1000) / 1000, direction: recChange > 0 ? "better" : "worse" },
    ],
  });
});

export default router;
