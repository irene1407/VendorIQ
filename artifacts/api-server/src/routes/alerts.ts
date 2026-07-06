import { Router } from "express";

const router = Router();

const ALERTS = [
  { id: "al-001", type: "fraud_detected", title: "Critical Fraud Alert — Shell Company Detected", message: "Global Procurement Partners flagged as potential shell company. Shared banking with 2 other vendors.", severity: "critical", isRead: false, supplierId: "s-020", supplierName: "Global Procurement Partners", createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), dismissedAt: null },
  { id: "al-002", type: "high_risk_supplier", title: "Risk Score Spike — Foxconn", message: "Foxconn risk score jumped from 61.2 to 78.4 following labor dispute reports. Review contract exposure.", severity: "error", isRead: false, supplierId: "s-003", supplierName: "Foxconn", createdAt: new Date(Date.now() - 18 * 3600000).toISOString(), dismissedAt: null },
  { id: "al-003", type: "price_spike", title: "Price Spike Detected — Lithium Carbonate", message: "Lithium carbonate prices increased 11.3% above forecast. 8 active contracts may be affected.", severity: "warning", isRead: false, supplierId: null, supplierName: null, createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), dismissedAt: null },
  { id: "al-004", type: "contract_expiring", title: "12 Contracts Expiring in 90 Days", message: "Samsung Electronics MSA, Infosys SLA, and 10 other contracts require renewal action.", severity: "warning", isRead: false, supplierId: null, supplierName: null, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), dismissedAt: null },
  { id: "al-005", type: "drift_detected", title: "Model Drift — Price Forecaster", message: "PSI drift score reached 0.91 (critical threshold: 0.80). Retraining recommended.", severity: "error", isRead: true, supplierId: null, supplierName: null, createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), dismissedAt: null },
  { id: "al-006", type: "negative_news", title: "Negative Coverage — Vale SA", message: "Port strike coverage across 14 financial outlets. Supply disruption risk elevated for iron ore contracts.", severity: "warning", isRead: false, supplierId: "s-013", supplierName: "Vale SA", createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), dismissedAt: null },
  { id: "al-007", type: "fraud_detected", title: "Invoice Duplication — Meridian Supplies", message: "Invoice INV-2024-8821 submitted twice with differing amounts. Automated payment hold applied.", severity: "error", isRead: false, supplierId: "s-019", supplierName: "Meridian Supplies Ltd", createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), dismissedAt: null },
  { id: "al-008", type: "high_risk_supplier", title: "New Critical Risk — Evergrande Logistics", message: "Risk score hit 88.3 (critical). Recommend immediate contract review and sourcing alternatives.", severity: "critical", isRead: false, supplierId: "s-015", supplierName: "Evergrande Logistics", createdAt: new Date(Date.now() - 1 * 3600000).toISOString(), dismissedAt: null },
  { id: "al-009", type: "pipeline_failure", title: "Recommender Training Pipeline Stalled", message: "Airflow DAG `supplier_recommender_retrain` has been in RUNNING state for 6+ hours. Manual intervention may be required.", severity: "warning", isRead: true, supplierId: null, supplierName: null, createdAt: new Date(Date.now() - 96 * 3600000).toISOString(), dismissedAt: null },
];

router.get("/alerts", (req, res) => {
  let alerts = [...ALERTS];
  const { read } = req.query;
  if (read === "true") alerts = alerts.filter(a => a.isRead);
  if (read === "false") alerts = alerts.filter(a => !a.isRead);
  res.json(alerts.filter(a => !a.dismissedAt));
});

router.post("/alerts/:id/read", (req, res) => {
  const alert = ALERTS.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  res.json({ ...alert, isRead: true });
});

router.post("/alerts/:id/dismiss", (req, res) => {
  const alert = ALERTS.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  res.status(204).send();
});

export default router;
