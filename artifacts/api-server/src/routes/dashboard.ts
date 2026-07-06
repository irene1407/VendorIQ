import { Router } from "express";

const router = Router();

router.get("/dashboard/summary", (_req, res) => {
  res.json({
    totalSpend: 847_320_500,
    totalSpendChange: -3.2,
    activeSuppliers: 342,
    highRiskSuppliers: 18,
    fraudAlertsOpen: 7,
    contractsExpiringSoon: 12,
    predictedSavings: 23_800_000,
    avgRiskScore: 34.7,
    onTimeDeliveryRate: 0.924,
  });
});

router.get("/dashboard/spend-trends", (_req, res) => {
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const data = months.map((month, i) => ({
    month,
    spend: 60_000_000 + Math.round(Math.sin(i * 0.7) * 8_000_000 + i * 1_200_000),
    budget: 72_000_000,
    savings: 2_000_000 + Math.round(Math.random() * 3_000_000),
  }));
  res.json(data);
});

router.get("/dashboard/supplier-leaderboard", (_req, res) => {
  res.json([
    { rank: 1, supplierId: "s-001", name: "Siemens AG", score: 97.2, category: "Industrial", country: "Germany", trend: "stable" },
    { rank: 2, supplierId: "s-004", name: "BASF SE", score: 95.8, category: "Chemicals", country: "Germany", trend: "up" },
    { rank: 3, supplierId: "s-008", name: "Infosys", score: 94.1, category: "IT Services", country: "India", trend: "up" },
    { rank: 4, supplierId: "s-002", name: "Samsung Electronics", score: 92.6, category: "Electronics", country: "South Korea", trend: "down" },
    { rank: 5, supplierId: "s-010", name: "DHL Supply Chain", score: 91.3, category: "Logistics", country: "Germany", trend: "stable" },
    { rank: 6, supplierId: "s-005", name: "Toyota Industries", score: 90.7, category: "Auto Parts", country: "Japan", trend: "up" },
    { rank: 7, supplierId: "s-007", name: "3M Company", score: 89.4, category: "Manufacturing", country: "USA", trend: "stable" },
    { rank: 8, supplierId: "s-011", name: "SAP SE", score: 88.9, category: "Software", country: "Germany", trend: "up" },
    { rank: 9, supplierId: "s-006", name: "LG Chem", score: 87.2, category: "Chemicals", country: "South Korea", trend: "down" },
    { rank: 10, supplierId: "s-012", name: "Tata Consultancy", score: 86.8, category: "IT Services", country: "India", trend: "stable" },
  ]);
});

router.get("/dashboard/risk-heatmap", (_req, res) => {
  res.json([
    { country: "China", lat: 35.86, lon: 104.19, riskScore: 72.3, supplierCount: 58 },
    { country: "Taiwan", lat: 23.69, lon: 120.96, riskScore: 68.1, supplierCount: 14 },
    { country: "Russia", lat: 61.52, lon: 105.31, riskScore: 91.4, supplierCount: 4 },
    { country: "Brazil", lat: -14.23, lon: -51.92, riskScore: 55.7, supplierCount: 12 },
    { country: "India", lat: 20.59, lon: 78.96, riskScore: 38.2, supplierCount: 31 },
    { country: "Germany", lat: 51.16, lon: 10.45, riskScore: 18.4, supplierCount: 27 },
    { country: "USA", lat: 37.09, lon: -95.71, riskScore: 22.1, supplierCount: 41 },
    { country: "Japan", lat: 36.20, lon: 138.25, riskScore: 21.8, supplierCount: 23 },
    { country: "South Korea", lat: 35.90, lon: 127.76, riskScore: 29.5, supplierCount: 17 },
    { country: "Mexico", lat: 23.63, lon: -102.55, riskScore: 47.3, supplierCount: 19 },
    { country: "Vietnam", lat: 14.05, lon: 108.27, riskScore: 44.8, supplierCount: 16 },
    { country: "Bangladesh", lat: 23.68, lon: 90.35, riskScore: 61.2, supplierCount: 8 },
    { country: "Turkey", lat: 38.96, lon: 35.24, riskScore: 58.9, supplierCount: 9 },
    { country: "Nigeria", lat: 9.08, lon: 8.67, riskScore: 79.4, supplierCount: 3 },
  ]);
});

export default router;
