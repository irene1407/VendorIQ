import { Router } from "express";

const router = Router();

const ML_API_URL =
  process.env.ML_API_URL ?? "http://127.0.0.1:8000";

type Anomaly = {
  vendor_id: string;
  is_anomaly: boolean;
  anomaly_score: number;
  severity: string;
};

type AnomalyResponse = {
  total_vendors: number;
  total_anomalies: number;
  anomalies: Anomaly[];
};

router.get("/fraud/alerts", async (req, res) => {
  try {
    const response = await fetch(
      `${ML_API_URL}/fraud/anomalies`,
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: "ML fraud detection API failed",
        details: errorText,
      });
    }

    const data =
      (await response.json()) as AnomalyResponse;

    let alerts = data.anomalies.map(
      (anomaly, index) => ({
        id: `anomaly-${index + 1}`,
        supplierId: anomaly.vendor_id,
        supplierName: anomaly.vendor_id,
        type: "vendor_anomaly",
        severity: anomaly.severity,
        status: "open",
        description:
          "Vendor behavior is statistically unusual compared with the normal vendor population.",
        anomalyScore: anomaly.anomaly_score,
        detectedAt: new Date().toISOString(),
        resolvedAt: null,
      }),
    );

    const { status, severity } = req.query;

    if (status) {
      alerts = alerts.filter(
        (alert) =>
          alert.status === status,
      );
    }

    if (severity) {
      alerts = alerts.filter(
        (alert) =>
          alert.severity === severity,
      );
    }

    return res.json(alerts);
  } catch (error) {
    console.error(
      "Fraud ML API error:",
      error,
    );

    return res.status(500).json({
      error: "Unable to fetch fraud anomalies",
      details:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
});

router.get(
  "/fraud/alerts/:id",
  async (req, res) => {
    try {
      const response = await fetch(
        `${ML_API_URL}/fraud/vendor/${encodeURIComponent(
          req.params.id,
        )}`,
      );

      if (response.status === 404) {
        return res.status(404).json({
          error: "Vendor not found",
        });
      }

      if (!response.ok) {
        const errorText =
          await response.text();

        return res.status(
          response.status,
        ).json({
          error:
            "ML fraud detection API failed",
          details: errorText,
        });
      }

      const anomaly =
        (await response.json()) as Anomaly;

      return res.json({
        id: req.params.id,
        supplierId: anomaly.vendor_id,
        supplierName: anomaly.vendor_id,
        type: "vendor_anomaly",
        severity: anomaly.severity,
        status: anomaly.is_anomaly
          ? "open"
          : "resolved",
        description:
          anomaly.is_anomaly
            ? "Vendor behavior is statistically unusual compared with the normal vendor population."
            : "No significant vendor anomaly detected.",
        anomalyScore:
          anomaly.anomaly_score,
        detectedAt:
          new Date().toISOString(),
        resolvedAt:
          anomaly.is_anomaly
            ? null
            : new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        "Fraud vendor lookup error:",
        error,
      );

      return res.status(500).json({
        error:
          "Unable to fetch vendor anomaly",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  },
);

router.post(
  "/fraud/alerts/:id/resolve",
  (_req, res) => {
    return res.status(501).json({
      error:
        "Fraud alert resolution is not persisted yet.",
    });
  },
);

router.get(
  "/fraud/stats",
  async (_req, res) => {
    try {
      const response = await fetch(
        `${ML_API_URL}/fraud/anomalies`,
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        return res.status(
          response.status,
        ).json({
          error:
            "ML fraud detection API failed",
          details: errorText,
        });
      }

      const data =
        (await response.json()) as AnomalyResponse;

      const alertsBySeverity = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };

      for (const anomaly of data.anomalies) {
        if (
          anomaly.severity in
          alertsBySeverity
        ) {
          alertsBySeverity[
            anomaly.severity as keyof typeof alertsBySeverity
          ] += 1;
        }
      }

      return res.json({
        totalAlerts:
          data.total_anomalies,
        openAlerts:
          data.total_anomalies,
        resolvedAlerts: 0,
        fraudPreventedAmount: 0,
        detectionRate:
          data.total_vendors > 0
            ? Number(
                (
                  data.total_anomalies /
                  data.total_vendors
                ).toFixed(4),
              )
            : 0,
        alertsByType: [
          {
            type: "vendor_anomaly",
            count:
              data.total_anomalies,
          },
        ],
        alertsBySeverity,
      });
    } catch (error) {
      console.error(
        "Fraud stats error:",
        error,
      );

      return res.status(500).json({
        error:
          "Unable to fetch fraud statistics",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      });
    }
  },
);

export default router;