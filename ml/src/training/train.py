from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from xgboost import XGBClassifier

from src.data.loader import load_vendor_data
from src.features.engineering import create_features


RANDOM_STATE = 42
TARGET = "risk_label"


def prepare_data(df: pd.DataFrame):
    """Prepare features and target for model training."""

    df = create_features(df)

    # Remove identifiers and target-related columns.
    columns_to_drop = [
        "vendor_id",
        "risk_label",
        "risk_probability",
        "risk_category",
    ]

    X = df.drop(columns=columns_to_drop)
    y = df[TARGET]

    return train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y,
    )


def build_models() -> dict:
    """Create the candidate ML models."""

    return {
        "logistic_regression": Pipeline(
            [
                ("scaler", StandardScaler()),
                (
                    "model",
                    LogisticRegression(
                        max_iter=2000,
                        random_state=RANDOM_STATE,
                    ),
                ),
            ]
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_leaf=3,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            class_weight="balanced",
        ),
        "xgboost": XGBClassifier(
            n_estimators=400,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.85,
            colsample_bytree=0.85,
            objective="binary:logistic",
            eval_metric="logloss",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
    }


def evaluate_model(model, X_test, y_test) -> dict:
    """Calculate classification metrics."""

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    return {
        "precision": precision_score(y_test, predictions),
        "recall": recall_score(y_test, predictions),
        "f1": f1_score(y_test, predictions),
        "roc_auc": roc_auc_score(y_test, probabilities),
        "pr_auc": average_precision_score(y_test, probabilities),
    }


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]

    dataset_path = project_root / "data" / "vendors.csv"
    model_dir = project_root / "models"

    model_dir.mkdir(parents=True, exist_ok=True)

    print("Loading dataset...")
    df = load_vendor_data(dataset_path)

    print(f"Dataset shape: {df.shape}")

    X_train, X_test, y_train, y_test = prepare_data(df)

    print(f"Training samples: {len(X_train):,}")
    print(f"Testing samples: {len(X_test):,}")

    models = build_models()

    results = {}

    for name, model in models.items():

        print()
        print(f"Training {name}...")

        model.fit(X_train, y_train)

        metrics = evaluate_model(
            model,
            X_test,
            y_test,
        )

        results[name] = metrics

        print(
            f"Precision: {metrics['precision']:.4f}"
        )
        print(
            f"Recall:    {metrics['recall']:.4f}"
        )
        print(
            f"F1:        {metrics['f1']:.4f}"
        )
        print(
            f"ROC-AUC:   {metrics['roc_auc']:.4f}"
        )
        print(
            f"PR-AUC:    {metrics['pr_auc']:.4f}"
        )

        model_path = model_dir / f"{name}.joblib"

        joblib.dump(model, model_path)

        print(f"Saved: {model_path}")

    results_df = pd.DataFrame(results).T

    results_path = model_dir / "model_comparison.csv"

    results_df.to_csv(results_path)

    print()
    print("=" * 60)
    print("MODEL COMPARISON")
    print("=" * 60)

    print(results_df.round(4))

    best_model_name = results_df["pr_auc"].idxmax()

    print()
    print(f"Best model based on PR-AUC: {best_model_name}")

    best_model_path = (
        model_dir / f"{best_model_name}.joblib"
    )

    final_model_path = model_dir / "vendor_risk_model.joblib"

    joblib.dump(
        joblib.load(best_model_path),
        final_model_path,
    )

    print(f"Final model saved: {final_model_path}")


if __name__ == "__main__":
    main()