import { Router } from "express";

const router = Router();

router.get("/savings/summary", (_req, res) => {
  const today = Date.now();
  const DAY = 86400000;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const ytd = months.slice(0, 10).map((month, i) => ({
    month,
    savings: 1_800_000 + Math.round(Math.sin(i * 0.8) * 400_000 + i * 120_000),
    fraud: 300_000 + Math.round(Math.random() * 200_000),
    risk: 500_000 + Math.round(Math.sin(i * 0.5) * 150_000),
  }));

  res.json({
    totalSavings: 23_800_000,
    fraudPrevented: 4_280_000,
    riskReduction: 8_400_000,
    timeSaved: 12_480,
    efficiencyGain: 34.7,
    ytdSavings: ytd,
  });
});

router.post("/savings/calculate", (req, res) => {
  const {
    supplierCount = 100,
    avgContractValue = 500_000,
    riskReductionTarget = 0.3,
    fraudDetectionRate = 0.9,
    automationLevel = 0.7,
  } = req.body as {
    supplierCount?: number;
    avgContractValue?: number;
    riskReductionTarget?: number;
    fraudDetectionRate?: number;
    automationLevel?: number;
  };

  const totalPortfolio = supplierCount * avgContractValue;
  const riskSavings = totalPortfolio * riskReductionTarget * 0.05;
  const fraudSavings = totalPortfolio * 0.02 * fraudDetectionRate;
  const processSavings = supplierCount * 12 * 180 * automationLevel;
  const year1 = Math.round(riskSavings * 0.6 + fraudSavings * 0.8 + processSavings);
  const year2 = Math.round(year1 * 1.35);
  const year3 = Math.round(year1 * 1.75);
  const investment = 480_000;
  const roiPercent = Math.round(((year1 + year2 + year3 - investment * 3) / (investment * 3)) * 100);

  res.json({
    year1, year2, year3,
    roiPercent,
    paybackMonths: Math.round((investment / year1) * 12),
    breakdown: { riskSavings: Math.round(riskSavings), fraudSavings: Math.round(fraudSavings), processSavings: Math.round(processSavings) },
  });
});

export default router;
