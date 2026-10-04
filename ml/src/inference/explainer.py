from pathlib import Path

import joblib
import pandas as pd
import shap


PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "vendor_risk_model_optimized.joblib"
)


class VendorRiskExplainer:
    """Generate SHAP explanations for vendor risk predictions."""

    def __init__(
        self,
        model_path: Path = MODEL_PATH,
    ):
        self.model = joblib.load(model_path)
        self.explainer = shap.TreeExplainer(self.model)

    def explain(
        self,
        features: pd.DataFrame,
        top_n: int = 5,
    ) -> list[dict]:

        # Make sure features match the model's training order.
        if hasattr(self.model, "feature_names_in_"):
            expected_features = list(
                self.model.feature_names_in_
            )

            features = features.reindex(
                columns=expected_features
            )

        shap_values = self.explainer.shap_values(
            features
        )

        # Binary classification.
        if isinstance(shap_values, list):
            values = shap_values[1][0]
        else:
            values = shap_values[0]

            # Handle newer SHAP output shape:
            # (samples, features, classes)
            if getattr(values, "ndim", 1) == 2:
                values = values[:, 0]

        explanations = []

        for feature, value in zip(
            features.columns,
            values,
        ):
            explanations.append(
                {
                    "feature": feature,
                    "impact": round(
                        float(value),
                        6,
                    ),
                    "direction": (
                        "increases_risk"
                        if value > 0
                        else "decreases_risk"
                    ),
                }
            )

        explanations.sort(
            key=lambda item: abs(
                item["impact"]
            ),
            reverse=True,
        )

        return explanations[:top_n]