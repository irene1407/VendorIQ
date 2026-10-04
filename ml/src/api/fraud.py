from fastapi import APIRouter, HTTPException

import joblib
import numpy as np
import pandas as pd

from src.fraud.service import detect_vendor_anomaly


router = APIRouter()


@router.get("/fraud/vendor/{vendor_id}")
def get_vendor_anomaly(vendor_id: str):
    try:
        return detect_vendor_anomaly(vendor_id)

    except ValueError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.get("/fraud/anomalies")
def get_anomalous_vendors():
    try:
        artifact = joblib.load(
            "models/vendor_anomaly_model.joblib"
        )

        df = pd.read_csv(
            "data/vendors.csv"
        )

        features = artifact["features"]

        X = (
            df[features]
            .apply(
                pd.to_numeric,
                errors="coerce",
            )
            .replace(
                [np.inf, -np.inf],
                np.nan,
            )
        )

        X = X.fillna(X.median())

        X_scaled = artifact["scaler"].transform(X)

        predictions = artifact["model"].predict(
            X_scaled
        )

        raw_scores = (
            -artifact["model"]
            .decision_function(X_scaled)
        )

        score_min = artifact["score_min"]
        score_max = artifact["score_max"]

        if score_max > score_min:
            scores = np.clip(
                (
                    raw_scores - score_min
                )
                / (score_max - score_min),
                0,
                1,
            )
        else:
            scores = np.zeros(
                len(df)
            )

        anomalies = []

        for index, prediction in enumerate(
            predictions
        ):
            if prediction != -1:
                continue

            score = float(
                scores[index]
            )

            if score >= 0.80:
                severity = "critical"
            elif score >= 0.60:
                severity = "high"
            elif score >= 0.40:
                severity = "medium"
            else:
                severity = "low"

            anomalies.append(
                {
                    "vendor_id": str(
                        df.iloc[index]["vendor_id"]
                    ),
                    "is_anomaly": True,
                    "anomaly_score": round(
                        score,
                        4,
                    ),
                    "severity": severity,
                }
            )

        anomalies.sort(
            key=lambda item: item[
                "anomaly_score"
            ],
            reverse=True,
        )

        return {
            "total_vendors": len(df),
            "total_anomalies": len(anomalies),
            "anomalies": anomalies,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )