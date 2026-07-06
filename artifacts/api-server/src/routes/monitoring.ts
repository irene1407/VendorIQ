import { Router } from "express";

const router = Router();

router.get("/monitoring/drift", (_req, res) => {
  const now = new Date().toISOString();
  res.json([
    { model: "Risk Scorer", metricName: "PSI (Payment Features)", currentValue: 0.18, baselineValue: 0.06, driftScore: 0.72, status: "warning", measuredAt: now },
    { model: "Risk Scorer", metricName: "KL Divergence (Country Risk)", currentValue: 0.09, baselineValue: 0.07, driftScore: 0.28, status: "normal", measuredAt: now },
    { model: "Price Forecaster", metricName: "PSI (Commodity Prices)", currentValue: 0.32, baselineValue: 0.08, driftScore: 0.91, status: "critical", measuredAt: now },
    { model: "Price Forecaster", metricName: "Wasserstein Distance", currentValue: 0.11, baselineValue: 0.09, driftScore: 0.31, status: "normal", measuredAt: now },
    { model: "Fraud Detector", metricName: "PSI (Transaction Volume)", currentValue: 0.07, baselineValue: 0.06, driftScore: 0.18, status: "normal", measuredAt: now },
    { model: "Fraud Detector", metricName: "Concept Drift (Label Shift)", currentValue: 0.24, baselineValue: 0.11, driftScore: 0.64, status: "warning", measuredAt: now },
    { model: "Contract Intel", metricName: "Embedding Distribution Shift", currentValue: 0.13, baselineValue: 0.10, driftScore: 0.42, status: "normal", measuredAt: now },
    { model: "Recommender", metricName: "Feature Distribution PSI", currentValue: 0.08, baselineValue: 0.07, driftScore: 0.21, status: "normal", measuredAt: now },
  ]);
});

router.get("/monitoring/model-metrics", (_req, res) => {
  res.json([
    { model: "Risk Scorer", version: "v2.4.1", avgLatencyMs: 42, p99LatencyMs: 118, errorRate: 0.003, predictionsToday: 2841, accuracy: 0.914, f1Score: 0.887, status: "healthy" },
    { model: "Price Forecaster", version: "v1.8.3", avgLatencyMs: 187, p99LatencyMs: 621, errorRate: 0.011, predictionsToday: 428, accuracy: null, f1Score: null, status: "degraded" },
    { model: "Fraud Detector", version: "v3.1.0", avgLatencyMs: 28, p99LatencyMs: 87, errorRate: 0.001, predictionsToday: 5_219, accuracy: 0.967, f1Score: 0.931, status: "healthy" },
    { model: "Contract Intel", version: "v1.2.7", avgLatencyMs: 1_840, p99LatencyMs: 4_210, errorRate: 0.027, predictionsToday: 73, accuracy: 0.891, f1Score: null, status: "healthy" },
    { model: "Recommender", version: "v2.0.2", avgLatencyMs: 94, p99LatencyMs: 284, errorRate: 0.005, predictionsToday: 1_127, accuracy: null, f1Score: null, status: "healthy" },
  ]);
});

router.get("/monitoring/prediction-volume", (_req, res) => {
  const today = Date.now();
  const DAY = 86400000;
  const points = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today - (29 - i) * DAY).toISOString().split("T")[0];
    return {
      date,
      risk: 2400 + Math.round(Math.sin(i * 0.5) * 400 + i * 20),
      forecast: 380 + Math.round(Math.cos(i * 0.3) * 50),
      fraud: 4800 + Math.round(Math.sin(i * 0.7) * 600 + i * 15),
      contract: 60 + Math.round(Math.random() * 30),
      recommender: 900 + Math.round(Math.sin(i * 0.4) * 150 + i * 10),
    };
  });
  res.json(points);
});

export default router;
