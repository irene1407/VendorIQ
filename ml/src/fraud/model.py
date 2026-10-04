from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import RobustScaler


BASE_DIR = Path(__file__).resolve().parents[2]

DATA_PATH = BASE_DIR / "data" / "vendors.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_PATH = MODEL_DIR / "vendor_anomaly_model.joblib"


FEATURES = [
    "revenue_growth",
    "debt_to_equity",
    "profit_margin",
    "cash_flow_ratio",
    "delivery_delay_rate",
    "defect_rate",
    "capacity_utilization",
    "lead_time_variability",
    "compliance_score",
    "certification_count",
    "regulatory_violations",
    "security_incidents",
    "data_breaches",
    "security_score",
    "customer_complaints",
    "negative_news_count",
    "sentiment_score",
    "country_risk_score",
    "geopolitical_exposure",
]


def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)

    missing = [
        feature
        for feature in FEATURES
        if feature not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing required features: {missing}"
        )

    return df


def train_model() -> dict:
    df = load_data()

    X = (
        df[FEATURES]
        .apply(pd.to_numeric, errors="coerce")
        .replace([np.inf, -np.inf], np.nan)
    )

    X = X.fillna(X.median())

    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X)

    model = IsolationForest(
        n_estimators=400,
        contamination=0.05,
        max_samples="auto",
        random_state=42,
        n_jobs=-1,
    )

    model.fit(X_scaled)

    raw_scores = -model.decision_function(X_scaled)

    score_min = float(raw_scores.min())
    score_max = float(raw_scores.max())

    if score_max > score_min:
        normalized_scores = (
            raw_scores - score_min
        ) / (score_max - score_min)
    else:
        normalized_scores = np.zeros(
            len(raw_scores)
        )

    predictions = model.predict(X_scaled)

    anomaly_count = int(
        np.sum(predictions == -1)
    )

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    artifact = {
        "model": model,
        "scaler": scaler,
        "features": FEATURES,
        "score_min": score_min,
        "score_max": score_max,
    }

    joblib.dump(
        artifact,
        MODEL_PATH,
    )

    print("Vendor anomaly model trained successfully.")
    print(f"Training rows: {len(df)}")
    print(f"Features: {len(FEATURES)}")
    print(f"Detected anomalies: {anomaly_count}")
    print(
        f"Anomaly rate: "
        f"{anomaly_count / len(df):.2%}"
    )
    print(f"Model saved to: {MODEL_PATH}")

    return {
        "rows": len(df),
        "anomalies": anomaly_count,
        "anomaly_rate": anomaly_count / len(df),
    }


if __name__ == "__main__":
    train_model()