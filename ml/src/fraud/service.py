from pathlib import Path

import joblib
import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]

DATA_PATH = BASE_DIR / "data" / "vendors.csv"
MODEL_PATH = BASE_DIR / "models" / "vendor_anomaly_model.joblib"


def load_artifact():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Anomaly model not found: {MODEL_PATH}"
        )

    return joblib.load(MODEL_PATH)


def load_vendor_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Vendor dataset not found: {DATA_PATH}"
        )

    return pd.read_csv(DATA_PATH)


def get_anomaly_score(
    raw_score: float,
    score_min: float,
    score_max: float,
) -> float:
    if score_max <= score_min:
        return 0.0

    normalized = (
        raw_score - score_min
    ) / (score_max - score_min)

    return float(
        np.clip(normalized, 0.0, 1.0)
    )


def get_severity(score: float) -> str:
    if score >= 0.80:
        return "critical"

    if score >= 0.60:
        return "high"

    if score >= 0.40:
        return "medium"

    return "low"


def detect_vendor_anomaly(
    vendor_id: str,
) -> dict:
    artifact = load_artifact()

    model = artifact["model"]
    scaler = artifact["scaler"]
    features = artifact["features"]
    score_min = artifact["score_min"]
    score_max = artifact["score_max"]

    df = load_vendor_data()

    vendor_rows = df[
        df["vendor_id"].astype(str)
        == str(vendor_id)
    ]

    if vendor_rows.empty:
        raise ValueError(
            f"Vendor not found: {vendor_id}"
        )

    vendor = vendor_rows.iloc[0]

    values = (
        vendor[features]
        .apply(pd.to_numeric, errors="coerce")
        .to_frame()
        .T
    )

    values = values.fillna(
        df[features]
        .apply(pd.to_numeric, errors="coerce")
        .median()
    )

    scaled = scaler.transform(values)

    prediction = int(
        model.predict(scaled)[0]
    )

    raw_score = float(
        -model.decision_function(scaled)[0]
    )

    anomaly_score = get_anomaly_score(
        raw_score,
        score_min,
        score_max,
    )

    is_anomaly = prediction == -1

    severity = (
        get_severity(anomaly_score)
        if is_anomaly
        else "low"
    )

    return {
        "vendor_id": str(vendor_id),
        "is_anomaly": is_anomaly,
        "anomaly_score": round(
            anomaly_score,
            4,
        ),
        "severity": severity,
    }