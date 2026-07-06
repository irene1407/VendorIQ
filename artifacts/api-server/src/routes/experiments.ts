import { Router } from "express";

const router = Router();

const EXPERIMENTS = [
  {
    id: "exp-001", name: "Risk Scorer v2.4 — XGBoost Hyperopt", model: "Risk Scorer", status: "finished",
    startedAt: new Date(Date.now() - 72 * 3600000).toISOString(), finishedAt: new Date(Date.now() - 68 * 3600000).toISOString(),
    metrics: { accuracy: 0.914, f1Score: 0.887, auc: 0.951, mse: null, mae: null, rmse: null },
    hyperparams: { n_estimators: 800, max_depth: 7, learning_rate: 0.048, subsample: 0.82, colsample_bytree: 0.74, min_child_weight: 3 },
  },
  {
    id: "exp-002", name: "Risk Scorer v2.5 — LightGBM + DART", model: "Risk Scorer", status: "running",
    startedAt: new Date(Date.now() - 2 * 3600000).toISOString(), finishedAt: null,
    metrics: { accuracy: 0.908, f1Score: 0.879, auc: 0.943, mse: null, mae: null, rmse: null },
    hyperparams: { n_estimators: 1000, max_depth: -1, learning_rate: 0.035, boosting_type: "dart", drop_rate: 0.1 },
  },
  {
    id: "exp-003", name: "Price Forecaster v1.9 — Prophet + LSTM Ensemble", model: "Price Forecaster", status: "finished",
    startedAt: new Date(Date.now() - 120 * 3600000).toISOString(), finishedAt: new Date(Date.now() - 112 * 3600000).toISOString(),
    metrics: { accuracy: null, f1Score: null, auc: null, mse: 1842.3, mae: 28.4, rmse: 42.9 },
    hyperparams: { prophet_changepoint_scale: 0.05, lstm_layers: 3, lstm_units: 128, dropout: 0.2, ensemble_weight_prophet: 0.4 },
  },
  {
    id: "exp-004", name: "Fraud Detector v3.1 — Isolation Forest + Autoencoder", model: "Fraud Detector", status: "finished",
    startedAt: new Date(Date.now() - 168 * 3600000).toISOString(), finishedAt: new Date(Date.now() - 160 * 3600000).toISOString(),
    metrics: { accuracy: 0.967, f1Score: 0.931, auc: 0.989, mse: null, mae: null, rmse: null },
    hyperparams: { isolation_contamination: 0.05, autoencoder_latent_dim: 16, autoencoder_layers: "[64,32,16,32,64]", threshold_percentile: 95 },
  },
  {
    id: "exp-005", name: "Contract Intel v1.3 — DistilBERT Fine-tune", model: "Contract Intel", status: "failed",
    startedAt: new Date(Date.now() - 48 * 3600000).toISOString(), finishedAt: new Date(Date.now() - 46 * 3600000).toISOString(),
    metrics: { accuracy: null, f1Score: null, auc: null, mse: null, mae: null, rmse: null },
    hyperparams: { epochs: 10, batch_size: 32, lr: 2e-5, warmup_steps: 500, weight_decay: 0.01 },
  },
];

router.get("/experiments", (req, res) => {
  let experiments = [...EXPERIMENTS];
  const { model, status } = req.query;
  if (model) experiments = experiments.filter(e => e.model === model);
  if (status) experiments = experiments.filter(e => e.status === status);
  res.json(experiments);
});

router.get("/experiments/:id", (req, res) => {
  const experiment = EXPERIMENTS.find(e => e.id === req.params.id) ?? EXPERIMENTS[0];
  const metricHistory = Array.from({ length: 20 }, (_, step) => ({
    step: step + 1,
    trainLoss: 0.9 - step * 0.038 + Math.random() * 0.02,
    valLoss: 0.95 - step * 0.033 + Math.random() * 0.03,
    accuracy: experiment.metrics.accuracy ? Math.min(experiment.metrics.accuracy, 0.5 + step * 0.022 + Math.random() * 0.01) : null,
  }));
  res.json({ ...experiment, metricHistory, artifacts: ["model.pkl", "feature_importance.png", "confusion_matrix.png", "roc_curve.png", "shap_summary.png"] });
});

export default router;
