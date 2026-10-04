import { Router } from "express";

const router = Router();

const ML_API_URL =
  process.env.ML_API_URL ?? "http://127.0.0.1:8000";

const COMMODITIES = [
  {
    id: "natural_gas_us",
    commodity: "Natural Gas",
    unit: "$/MMBtu",
  },
  {
    id: "aluminum",
    commodity: "Aluminum",
    unit: "$/mt",
  },
  {
    id: "copper",
    commodity: "Copper",
    unit: "$/mt",
  },
  {
    id: "nickel",
    commodity: "Nickel",
    unit: "$/mt",
  },
  {
    id: "zinc",
    commodity: "Zinc",
    unit: "$/mt",
  },
];

router.get("/forecast/commodities", (_req, res) => {
  res.json(COMMODITIES);
});

router.get("/forecast/:commodity", async (req, res) => {
  const commodityId = decodeURIComponent(req.params.commodity);

  const commodity = COMMODITIES.find(
    (item) =>
      item.id.toLowerCase() === commodityId.toLowerCase() ||
      item.commodity.toLowerCase() === commodityId.toLowerCase(),
  );

  if (!commodity) {
    return res.status(404).json({
      error: "Commodity not found",
    });
  }

  try {
    const response = await fetch(
      `${ML_API_URL}/forecast/${encodeURIComponent(commodity.id)}?periods=3`,
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: "ML forecast API failed",
        details: errorText,
      });
    }

    const mlData = (await response.json()) as {
  commodity: string;
  unit: string;
  currentPrice: number;
  forecastPrice: number;
  change: number;
  changePercent: number;
  trend: string;
  historical: Array<{
    date: string;
    actual: number;
  }>;
  forecast: Array<{
    date: string;
    predicted: number;
    lowerBound: number;
    upperBound: number;
  }>;
};

    const historical = Array.isArray(mlData.historical)
      ? mlData.historical
      : [];

    const forecast = Array.isArray(mlData.forecast)
      ? mlData.forecast
      : [];

    const points = [
      ...historical.map((point: any) => ({
        date: point.date,
        actual: point.actual,
        predicted: null,
        lowerBound: null,
        upperBound: null,
      })),
      ...forecast.map((point: any) => ({
        date: point.date,
        actual: null,
        predicted: point.predicted,
        lowerBound: point.lowerBound,
        upperBound: point.upperBound,
      })),
    ];

    const confidence = forecast.length
      ? forecast.reduce(
          (sum: number, point: any) => {
            const range = point.upperBound - point.lowerBound;

            const relativeWidth =
              range / Math.max(Math.abs(point.predicted), 1);

            return sum + Math.max(0, 1 - relativeWidth);
          },
          0,
        ) / forecast.length
      : 0;

    return res.json({
      commodity: mlData.commodity,
      unit: mlData.unit,
      currentPrice: mlData.currentPrice,
      forecastPrice: mlData.forecastPrice,
      change: mlData.change,
      changePercent: mlData.changePercent,
      trend: mlData.trend,
      confidence: Number(confidence.toFixed(2)),
      points,
    });
  } catch (error) {
    console.error("Forecast ML API error:", error);

    res.status(500).json({
      error: "Unable to fetch ML forecast",
      details:
        error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;