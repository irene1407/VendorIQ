from pathlib import Path
import json

import joblib
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "vendor_risk_model_optimized.joblib"
)

THRESHOLD_PATH = (
    PROJECT_ROOT
    / "models"
    / "optimal_threshold.json"
)


class VendorRiskPredictor:
    """Production inference service for VendorIQ."""

    def __init__(
        self,
        model_path: Path = MODEL_PATH,
        threshold_path: Path = THRESHOLD_PATH,
    ):
        self.model = joblib.load(model_path)

        with open(
            threshold_path,
            "r",
            encoding="utf-8",
        ) as file:
            config = json.load(file)

        self.threshold = float(
            config["threshold"]
        )

    def prepare_features(
        self,
        vendor_data: dict,
    ) -> pd.DataFrame:
        """Convert vendor input into model features."""

        df = pd.DataFrame([vendor_data])

        # These fields are never model inputs.
        excluded_columns = {
            "vendor_id",
            "risk_label",
            "risk_probability",
            "risk_category",
        }

        df = df.drop(
            columns=[
                column
                for column in excluded_columns
                if column in df.columns
            ]
        )

        return df

    def predict(
        self,
        vendor_data: dict,
    ) -> dict:
        """Generate a vendor risk prediction."""

        features = self.prepare_features(
            vendor_data
        )

        probability = float(
            self.model.predict_proba(features)[0][1]
        )

        risk_label = int(
            probability >= self.threshold
        )

        if probability >= self.threshold:
            risk_category = "HIGH"
        elif probability >= self.threshold * 0.60:
            risk_category = "MEDIUM"
        else:
            risk_category = "LOW"

        return {
            "vendor_id": vendor_data.get(
                "vendor_id"
            ),
            "risk_category": risk_category,
            "risk_label": risk_label,
            "risk_probability": round(
                probability,
                4,
            ),
            "decision_threshold": round(
                self.threshold,
                4,
            ),
        }


_predictor = None


def get_predictor() -> VendorRiskPredictor:
    """Return a cached predictor instance."""

    global _predictor

    if _predictor is None:
        _predictor = VendorRiskPredictor()

    return _predictor


def predict_vendor(
    vendor_data: dict,
) -> dict:
    """Public prediction function."""

    return get_predictor().predict(
        vendor_data
    )