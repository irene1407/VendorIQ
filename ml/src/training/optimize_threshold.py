from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

from src.data.loader import load_vendor_data
from src.features.engineering import create_features


RANDOM_STATE = 42
TARGET = "risk_label"


def prepare_features(df: pd.DataFrame):
    df = create_features(df)

    columns_to_drop = [
        "vendor_id",
        "risk_label",
        "risk_probability",
        "risk_category",
    ]

    X = df.drop(columns=columns_to_drop)
    y = df[TARGET]

    return X, y


def find_best_threshold(model, X_val, y_val):
    probabilities = model.predict_proba(X_val)[:, 1]

    thresholds = np.arange(0.10, 0.91, 0.01)

    best_threshold = 0.50
    best_f2 = -1

    results = []

    for threshold in thresholds:
        predictions = (
            probabilities >= threshold
        ).astype(int)

        precision = precision_score(
            y_val,
            predictions,
            zero_division=0,
        )

        recall = recall_score(
            y_val,
            predictions,
            zero_division=0,
        )

        f1 = f1_score(
            y_val,
            predictions,
            zero_division=0,
        )

        # F2 gives recall more importance than precision.
        if precision + recall == 0:
            f2 = 0
        else:
            f2 = (
                5 * precision * recall
                / (4 * precision + recall)
            )

        results.append(
            {
                "threshold": threshold,
                "precision": precision,
                "recall": recall,
                "f1": f1,
                "f2": f2,
            }
        )

        if f2 > best_f2:
            best_f2 = f2
            best_threshold = threshold

    return best_threshold, pd.DataFrame(results)


def main():

    project_root = Path(__file__).resolve().parents[2]

    dataset_path = (
        project_root / "data" / "vendors.csv"
    )

    model_dir = project_root / "models"

    output_dir = (
        model_dir / "threshold_optimization"
    )

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("Loading dataset...")

    df = load_vendor_data(dataset_path)

    X, y = prepare_features(df)

    # 60% train, 20% validation, 20% test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=0.40,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    X_val, X_test, y_val, y_test = train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        random_state=RANDOM_STATE,
        stratify=y_temp,
    )

    print(f"Training samples:   {len(X_train):,}")
    print(f"Validation samples: {len(X_val):,}")
    print(f"Test samples:       {len(X_test):,}")

    print()
    print("Training Random Forest...")

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=3,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        class_weight="balanced",
    )

    model.fit(X_train, y_train)

    print("Finding optimal threshold...")

    best_threshold, threshold_results = (
        find_best_threshold(
            model,
            X_val,
            y_val,
        )
    )

    print()
    print(
        f"Optimal threshold: {best_threshold:.2f}"
    )

    threshold_results.to_csv(
        output_dir / "threshold_results.csv",
        index=False,
    )

    # Evaluate ONLY ONCE on the untouched test set.
    test_probabilities = model.predict_proba(
        X_test
    )[:, 1]

    test_predictions = (
        test_probabilities >= best_threshold
    ).astype(int)

    precision = precision_score(
        y_test,
        test_predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        test_predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        test_predictions,
        zero_division=0,
    )

    roc_auc = roc_auc_score(
        y_test,
        test_probabilities,
    )

    print()
    print("=" * 60)
    print("OPTIMIZED RANDOM FOREST")
    print("=" * 60)

    print(
        f"Threshold : {best_threshold:.2f}"
    )
    print(
        f"Precision : {precision:.4f}"
    )
    print(
        f"Recall    : {recall:.4f}"
    )
    print(
        f"F1        : {f1:.4f}"
    )
    print(
        f"ROC-AUC   : {roc_auc:.4f}"
    )

    print()
    print("Classification Report:")
    print(
        classification_report(
            y_test,
            test_predictions,
            digits=4,
        )
    )

    # Save optimized model.
    model_path = (
        model_dir
        / "vendor_risk_model_optimized.joblib"
    )

    joblib.dump(
        model,
        model_path,
    )

    # Save threshold separately.
    threshold_path = (
        model_dir
        / "optimal_threshold.json"
    )

    with open(
        threshold_path,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            {
                "threshold": float(
                    best_threshold
                ),
                "model": "random_forest",
                "optimization_metric": "F2",
            },
            f,
            indent=4,
        )

    print()
    print(f"Model saved: {model_path}")
    print(
        f"Threshold saved: {threshold_path}"
    )


if __name__ == "__main__":
    main()