import { Router } from "express";

const router = Router();

const FRAUD_ALERTS = [
  {
    id: "fa-001", supplierId: "s-019", supplierName: "Meridian Supplies Ltd", type: "invoice_duplication",
    severity: "high", status: "open", description: "Invoice #INV-2024-8821 submitted twice with different amounts (₹1.18Cr vs ₹1.31Cr) within 72 hours.",
    anomalyScore: 0.94, detectedAt: new Date(Date.now() - 2 * 3600000).toISOString(), resolvedAt: null,
  },
  {
    id: "fa-002", supplierId: "s-020", supplierName: "Global Procurement Partners", type: "shell_company",
    severity: "critical", status: "investigating", description: "Vendor registered 11 days before first contract award. No verifiable business address. Shared banking details with 2 other vendors.",
    anomalyScore: 0.98, detectedAt: new Date(Date.now() - 24 * 3600000).toISOString(), resolvedAt: null,
  },
  {
    id: "fa-003", supplierId: "s-021", supplierName: "Apex Industrial Corp", type: "bid_rigging",
    severity: "critical", status: "investigating", description: "Identical bid documents detected across 4 nominally independent vendors. Pattern consistent with coordinated bid manipulation.",
    anomalyScore: 0.97, detectedAt: new Date(Date.now() - 48 * 3600000).toISOString(), resolvedAt: null,
  },
  {
    id: "fa-004", supplierId: "s-022", supplierName: "Titan Logistics", type: "price_manipulation",
    severity: "medium", status: "open", description: "Sudden 34% price increase on standard items following contract renewal. Pricing deviates 2.8 sigma from category benchmark.",
    anomalyScore: 0.81, detectedAt: new Date(Date.now() - 6 * 3600000).toISOString(), resolvedAt: null,
  },
  {
    id: "fa-005", supplierId: "s-023", supplierName: "Nexus Materials", type: "duplicate_vendor",
    severity: "medium", status: "open", description: "Near-identical company name, contact email domain, and bank account routing number to existing vendor NexusMat Inc (registered 2019).",
    anomalyScore: 0.87, detectedAt: new Date(Date.now() - 12 * 3600000).toISOString(), resolvedAt: null,
  },
  {
    id: "fa-006", supplierId: "s-024", supplierName: "Pacific Trade Solutions", type: "kickback",
    severity: "high", status: "investigating", description: "Procurement officer personal bank account received wire transfers totalling ₹69.7L from this vendor within 30 days of contract award.",
    anomalyScore: 0.93, detectedAt: new Date(Date.now() - 72 * 3600000).toISOString(), resolvedAt: null,
  },
  {
    id: "fa-007", supplierId: "s-025", supplierName: "Horizon Electronics", type: "invoice_duplication",
    severity: "low", status: "resolved", description: "Duplicate invoice submitted. Vendor confirmed accounting system error. Credit note issued.",
    anomalyScore: 0.71, detectedAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), resolvedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
  },
];

router.get("/fraud/alerts", (req, res) => {
  let alerts = [...FRAUD_ALERTS];
  const { status, severity } = req.query;
  if (status) alerts = alerts.filter(a => a.status === status);
  if (severity) alerts = alerts.filter(a => a.severity === severity);
  res.json(alerts);
});

router.post("/fraud/alerts/:id/resolve", (req, res) => {
  const alert = FRAUD_ALERTS.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  const resolved = { ...alert, status: "resolved", resolvedAt: new Date().toISOString() };
  res.json(resolved);
});

router.get("/fraud/stats", (_req, res) => {
  res.json({
    totalAlerts: 34,
    openAlerts: 7,
    resolvedAlerts: 27,
    fraudPreventedAmount: 4_280_000,
    detectionRate: 0.94,
    alertsByType: [
      { type: "invoice_duplication", count: 12 },
      { type: "shell_company", count: 5 },
      { type: "bid_rigging", count: 6 },
      { type: "price_manipulation", count: 4 },
      { type: "kickback", count: 3 },
      { type: "duplicate_vendor", count: 3 },
      { type: "collusion", count: 1 },
    ],
  });
});

export default router;
