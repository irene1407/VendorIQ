import { Router } from "express";

const router = Router();

type Scenario = {
  inflationDelta: number;
  shippingDelayDays: number;
  priceDelta: number;
  demandDelta: number;
};

type SupplierBaseline = {
  name: string;
  country: string;
  riskScore: number;
  predictedPrice: number;
  fraudProbability: number;
  recommendationScore: number;
};

const SUPPLIER_BASELINES: Record<string, SupplierBaseline> = {
  "SUP-001": {
    name: "Foxconn",
    country: "Taiwan",
    riskScore: 50.5,
    predictedPrice: 14_800,
    fraudProbability: 0.08,
    recommendationScore: 58,
  },

  "SUP-002": {
    name: "Vale SA",
    country: "Brazil",
    riskScore: 35.2,
    predictedPrice: 11_900,
    fraudProbability: 0.06,
    recommendationScore: 67,
  },

  "SUP-003": {
    name: "Alibaba Cloud",
    country: "China",
    riskScore: 29.0,
    predictedPrice: 9_800,
    fraudProbability: 0.05,
    recommendationScore: 72,
  },

  "SUP-004": {
    name: "Evergrande Logistics",
    country: "China",
    riskScore: 59.2,
    predictedPrice: 13_600,
    fraudProbability: 0.12,
    recommendationScore: 46,
  },

  "SUP-005": {
    name: "Samsung Electronics",
    country: "South Korea",
    riskScore: 13.0,
    predictedPrice: 15_200,
    fraudProbability: 0.03,
    recommendationScore: 87,
  },

  "SUP-006": {
    name: "Siemens AG",
    country: "Germany",
    riskScore: 12.4,
    predictedPrice: 16_100,
    fraudProbability: 0.025,
    recommendationScore: 89,
  },

  "SUP-007": {
    name: "BASF SE",
    country: "Germany",
    riskScore: 17.1,
    predictedPrice: 12_700,
    fraudProbability: 0.035,
    recommendationScore: 84,
  },

  "SUP-008": {
    name: "Petrobras",
    country: "Brazil",
    riskScore: 30.2,
    predictedPrice: 13_900,
    fraudProbability: 0.055,
    recommendationScore: 70,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 1) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

router.post("/simulate", (req, res) => {
  const { supplierId, scenario } = req.body as {
    supplierId?: string;
    scenario?: Scenario;
  };

  if (!supplierId) {
    return res.status(400).json({
      message: "supplierId is required.",
    });
  }

  if (!scenario) {
    return res.status(400).json({
      message: "scenario is required.",
    });
  }

  const supplier = SUPPLIER_BASELINES[supplierId];

  if (!supplier) {
    return res.status(404).json({
      message: `Supplier '${supplierId}' was not found.`,
    });
  }

  const {
    inflationDelta = 0,
    shippingDelayDays = 0,
    priceDelta = 0,
    demandDelta = 0,
  } = scenario;

  /*
   * Scenario impact model
   *
   * Positive inflation increases risk.
   * Shipping delays increase risk.
   * Higher supplier pricing increases risk.
   * Strong negative demand shock increases risk.
   * Positive demand can partially offset risk.
   */

  const inflationImpact =
    inflationDelta * 1.8;

  const shippingImpact =
    shippingDelayDays * 0.9;

  const priceRiskImpact =
    Math.max(0, priceDelta) * 0.5;

  const demandImpact =
    demandDelta < 0
      ? Math.abs(demandDelta) * 0.18
      : -Math.min(demandDelta * 0.05, 5);

  const riskChange =
    inflationImpact +
    shippingImpact +
    priceRiskImpact +
    demandImpact;

  const simRisk = clamp(
    supplier.riskScore + riskChange,
    0,
    100,
  );

  /*
   * Supplier price impact
   *
   * Inflation and supplier-specific price movement
   * affect the predicted procurement price.
   */

  const inflationPriceImpact =
    supplier.predictedPrice *
    (inflationDelta / 100);

  const supplierPriceImpact =
    supplier.predictedPrice *
    (priceDelta / 100);

  const shippingPriceImpact =
    supplier.predictedPrice *
    (shippingDelayDays * 0.003);

  const demandPriceImpact =
    supplier.predictedPrice *
    (-demandDelta * 0.001);

  const priceChange =
    inflationPriceImpact +
    supplierPriceImpact +
    shippingPriceImpact +
    demandPriceImpact;

  const simPrice = Math.max(
    0,
    supplier.predictedPrice + priceChange,
  );

  /*
   * Anomaly / fraud-risk estimate
   *
   * This is an anomaly probability estimate for the
   * scenario, not a confirmed fraud prediction.
   */

  const inflationFraudImpact =
    Math.max(0, inflationDelta) * 0.003;

  const shippingFraudImpact =
    shippingDelayDays * 0.001;

  const priceFraudImpact =
    Math.max(0, priceDelta) * 0.002;

  const demandFraudImpact =
    demandDelta < 0
      ? Math.abs(demandDelta) * 0.0008
      : 0;

  const fraudChange =
    inflationFraudImpact +
    shippingFraudImpact +
    priceFraudImpact +
    demandFraudImpact;

  const simFraud = clamp(
    supplier.fraudProbability + fraudChange,
    0,
    1,
  );

  /*
   * Recommendation score is represented on a 0-100 scale.
   */

  const recommendationChange =
    -(riskChange * 0.45) -
    (fraudChange * 100 * 0.4);

  const simRecommendation = clamp(
    supplier.recommendationScore +
      recommendationChange,
    0,
    100,
  );

  const roundedRisk = round(simRisk, 1);
  const roundedPrice = Math.round(simPrice);
  const roundedFraud = round(simFraud, 3);
  const roundedRecommendation = round(
    simRecommendation,
    1,
  );

  const roundedRiskChange = round(
    riskChange,
    1,
  );

  const roundedPriceChange = Math.round(
    priceChange,
  );

  const roundedFraudChange = round(
    fraudChange,
    3,
  );

  const roundedRecommendationChange =
    round(recommendationChange, 1);

  return res.json({
    supplierId,

    supplier: {
      name: supplier.name,
      country: supplier.country,
    },

    baseline: {
      riskScore: supplier.riskScore,
      predictedPrice: supplier.predictedPrice,
      fraudProbability: supplier.fraudProbability,
      recommendationScore:
        supplier.recommendationScore,
    },

    simulated: {
      riskScore: roundedRisk,
      predictedPrice: roundedPrice,
      fraudProbability: roundedFraud,
      recommendationScore:
        roundedRecommendation,
    },

    changes: [
      {
        metric: "Risk Score",
        baseline: supplier.riskScore,
        simulated: roundedRisk,
        delta: roundedRiskChange,
        direction:
          roundedRiskChange > 0
            ? "worse"
            : roundedRiskChange < 0
              ? "better"
              : "neutral",
      },

      {
        metric: "Predicted Price (INR)",
        baseline: supplier.predictedPrice,
        simulated: roundedPrice,
        delta: roundedPriceChange,
        direction:
          roundedPriceChange > 0
            ? "worse"
            : roundedPriceChange < 0
              ? "better"
              : "neutral",
      },

      {
        metric: "Fraud / Anomaly Probability",
        baseline: supplier.fraudProbability,
        simulated: roundedFraud,
        delta: roundedFraudChange,
        direction:
          roundedFraudChange > 0
            ? "worse"
            : roundedFraudChange < 0
              ? "better"
              : "neutral",
      },

      {
        metric: "Recommendation Score",
        baseline:
          supplier.recommendationScore,
        simulated:
          roundedRecommendation,
        delta:
          roundedRecommendationChange,
        direction:
          roundedRecommendationChange > 0
            ? "better"
            : roundedRecommendationChange < 0
              ? "worse"
              : "neutral",
      },
    ],
  });
});

export default router;