from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd

from sklearn.metrics import (
    ConfusionMatrixDisplay,
    classification_report,
    confusion_matrix,
    precision_recall_curve,
    roc_auc_score,
    roc_curve,
)

from src.data.loader import load_vendor_data
from src.features.engineering import create_features
from src.training.train import prepare_data


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]

    dataset_path = project_root / "data" / "vendors.csv"
    model_path = project_root / "models" / "vendor_risk_model.joblib"
    results_dir = project_root / "models" / "evaluation"

    results_dir.mkdir(parents=True, exist_ok=True)

    print("Loading dataset...")
    df = load_vendor_data(dataset_path)

    print("Preparing test data...")
    X_train, X_test, y_train, y_test = prepare_data(df)

    print("Loading trained model...")
    model = joblib.load(model_path)

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    # Classification report
    report = classification_report(
        y_test,
        predictions,
        output_dict=True,
    )

    report_df = pd.DataFrame(report).transpose()
    report_df.to_csv(
        results_dir / "classification_report.csv"
    )

    print("\nClassification Report")
    print(
        classification_report(
            y_test,
            predictions,
            digits=4,
        )
    )

    # ROC-AUC
    roc_auc = roc_auc_score(
        y_test,
        probabilities,
    )

    print(f"ROC-AUC: {roc_auc:.4f}")

    # Confusion matrix
    cm = confusion_matrix(
        y_test,
        predictions,
    )

    ConfusionMatrixDisplay(
        confusion_matrix=cm
    ).plot()

    plt.title("VendorIQ Confusion Matrix")
    plt.tight_layout()
    plt.savefig(
        results_dir / "confusion_matrix.png",
        dpi=200,
    )
    plt.close()

    # ROC curve
    fpr, tpr, _ = roc_curve(
        y_test,
        probabilities,
    )

    plt.figure(figsize=(8, 6))
    plt.plot(
        fpr,
        tpr,
        label=f"ROC-AUC = {roc_auc:.4f}",
    )
    plt.plot(
        [0, 1],
        [0, 1],
        linestyle="--",
    )
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("VendorIQ ROC Curve")
    plt.legend()
    plt.tight_layout()
    plt.savefig(
        results_dir / "roc_curve.png",
        dpi=200,
    )
    plt.close()

    # Precision-recall curve
    precision, recall, thresholds = precision_recall_curve(
        y_test,
        probabilities,
    )

    plt.figure(figsize=(8, 6))
    plt.plot(
        recall,
        precision,
    )
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title("VendorIQ Precision-Recall Curve")
    plt.tight_layout()
    plt.savefig(
        results_dir / "precision_recall_curve.png",
        dpi=200,
    )
    plt.close()

    # Save predictions for error analysis
    evaluation_df = X_test.copy()

    evaluation_df["actual_risk"] = y_test.values
    evaluation_df["predicted_risk"] = predictions
    evaluation_df["risk_probability"] = probabilities

    evaluation_df.to_csv(
        results_dir / "test_predictions.csv",
        index=False,
    )

    print("\nEvaluation complete.")
    print(f"Results saved to: {results_dir}")


if __name__ == "__main__":
    main()