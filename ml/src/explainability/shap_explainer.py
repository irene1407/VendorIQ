from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd
import shap

from src.data.loader import load_vendor_data
from src.features.engineering import create_features


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    df = create_features(df)

    columns_to_drop = [
        "vendor_id",
        "risk_label",
        "risk_probability",
        "risk_category",
    ]

    return df.drop(columns=columns_to_drop)


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]

    dataset_path = (
        project_root / "data" / "vendors.csv"
    )

    model_path = (
        project_root
        / "models"
        / "vendor_risk_model_optimized.joblib"
    )

    output_dir = (
        project_root / "models" / "explainability"
    )

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("Loading dataset...")

    df = load_vendor_data(dataset_path)

    X = prepare_features(df)

    print("Loading optimized model...")

    model = joblib.load(model_path)

    print("Creating SHAP explainer...")

    explainer = shap.TreeExplainer(model)

    print("Calculating SHAP values...")

    shap_values = explainer.shap_values(X)

    # Handle SHAP output format differences
    # between SHAP versions.
    if isinstance(shap_values, list):
        shap_values_for_positive_class = shap_values[1]
    else:
        shap_values_for_positive_class = shap_values

        if len(shap_values.shape) == 3:
            shap_values_for_positive_class = (
                shap_values[:, :, 1]
            )

    # --------------------------------------------------
    # Global feature importance
    # --------------------------------------------------

    print("Creating global feature importance...")

    plt.figure()

    shap.summary_plot(
        shap_values_for_positive_class,
        X,
        show=False,
    )

    plt.tight_layout()

    plt.savefig(
        output_dir / "shap_summary.png",
        dpi=200,
        bbox_inches="tight",
    )

    plt.close()

    # --------------------------------------------------
    # Bar feature importance
    # --------------------------------------------------

    plt.figure()

    shap.summary_plot(
        shap_values_for_positive_class,
        X,
        plot_type="bar",
        show=False,
    )

    plt.tight_layout()

    plt.savefig(
        output_dir / "shap_feature_importance.png",
        dpi=200,
        bbox_inches="tight",
    )

    plt.close()

    # --------------------------------------------------
    # Calculate global importance table
    # --------------------------------------------------

    importance = pd.DataFrame(
        {
            "feature": X.columns,
            "mean_abs_shap": abs(
                shap_values_for_positive_class
            ).mean(axis=0),
        }
    )

    importance = importance.sort_values(
        "mean_abs_shap",
        ascending=False,
    )

    importance.to_csv(
        output_dir / "feature_importance.csv",
        index=False,
    )

    # --------------------------------------------------
    # Individual vendor explanations
    # --------------------------------------------------

    print("Generating individual explanations...")

    vendor_index = 0

    vendor_shap = shap_values_for_positive_class[
        vendor_index
    ]

    vendor_explanation = pd.DataFrame(
        {
            "feature": X.columns,
            "feature_value": X.iloc[
                vendor_index
            ].values,
            "shap_value": vendor_shap,
        }
    )

    vendor_explanation[
        "absolute_shap"
    ] = vendor_explanation[
        "shap_value"
    ].abs()

    vendor_explanation = vendor_explanation.sort_values(
        "absolute_shap",
        ascending=False,
    )

    vendor_explanation.to_csv(
        output_dir / "vendor_00001_explanation.csv",
        index=False,
    )

    print()
    print("=" * 60)
    print("SHAP EXPLAINABILITY COMPLETE")
    print("=" * 60)

    print()
    print("Top risk-driving features:")

    print(
        importance.head(10).to_string(
            index=False
        )
    )

    print()
    print(
        f"Results saved to: {output_dir}"
    )


if __name__ == "__main__":
    main()