import { Router } from "express";

const router = Router();

const COMMODITIES = [
  { commodity: "Copper", currentPrice: 767_520, forecastPrice: 814_230, change: 46_710, changePercent: 6.17, trend: "up", confidence: 0.84, unit: "INR/mt" },
  { commodity: "Silicon Wafers", currentPrice: 151_060, forecastPrice: 161_020, change: 9_960, changePercent: 6.59, trend: "up", confidence: 0.79, unit: "INR/unit" },
  { commodity: "Rare Earth Elements", currentPrice: 340_300, forecastPrice: 322_040, change: -18_260, changePercent: -5.37, trend: "down", confidence: 0.72, unit: "INR/kg" },
  { commodity: "Polypropylene", currentPrice: 112_880, forecastPrice: 107_070, change: -5_810, changePercent: -5.15, trend: "down", confidence: 0.81, unit: "INR/mt" },
  { commodity: "Steel (HRC)", currentPrice: 60_175, forecastPrice: 62_084, change: 1_909, changePercent: 3.17, trend: "up", confidence: 0.88, unit: "INR/mt" },
  { commodity: "Lithium", currentPrice: 1_178_600, forecastPrice: 1_311_400, change: 132_800, changePercent: 11.27, trend: "up", confidence: 0.76, unit: "INR/mt" },
  { commodity: "Aluminum", currentPrice: 200_030, forecastPrice: 197_540, change: -2_490, changePercent: -1.24, trend: "stable", confidence: 0.91, unit: "INR/mt" },
  { commodity: "Natural Gas", currentPrice: 235.7, forecastPrice: 266.4, change: 30.7, changePercent: 13.03, trend: "up", confidence: 0.68, unit: "INR/MMBtu" },
];

router.get("/forecast/commodities", (_req, res) => {
  res.json(COMMODITIES);
});

router.get("/forecast/:commodity", (req, res) => {
  const commodityName = decodeURIComponent(req.params.commodity);
  const meta = COMMODITIES.find(c => c.commodity.toLowerCase() === commodityName.toLowerCase()) ?? COMMODITIES[0];

  const today = Date.now();
  const DAY = 86400000;
  const points = [];

  // 60 days historical + 90 days forecast
  const basePrice = meta.currentPrice;
  for (let i = -60; i <= 90; i++) {
    const date = new Date(today + i * DAY).toISOString().split("T")[0];
    const noise = (Math.sin(i * 0.4) * 0.03 + Math.cos(i * 0.15) * 0.02) * basePrice;
    const trend = i * (meta.changePercent / 100 / 90) * basePrice;
    const predicted = Math.round((basePrice + trend + noise) * 100) / 100;
    const actual = i <= 0 ? predicted + Math.round((Math.random() - 0.5) * basePrice * 0.01 * 100) / 100 : null;
    const band = Math.abs(i) * basePrice * 0.001;

    points.push({
      date,
      actual,
      predicted,
      lowerBound: i > 0 ? Math.round((predicted - band) * 100) / 100 : null,
      upperBound: i > 0 ? Math.round((predicted + band) * 100) / 100 : null,
    });
  }

  res.json({ commodity: meta.commodity, unit: meta.unit, points });
});

export default router;
