from pathlib import Path

import pandas as pd


REQUIRED_COLUMNS = {
    "vendor_id",
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
    "risk_probability",
    "risk_label",
    "risk_category",
}


def validate_dataset(df: pd.DataFrame) -> None:
    """Validate the VendorIQ dataset."""

    missing_columns = REQUIRED_COLUMNS - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {sorted(missing_columns)}"
        )

    if df.empty:
        raise ValueError("Dataset is empty.")

    if df["vendor_id"].duplicated().any():
        raise ValueError("Duplicate vendor IDs detected.")

    if df.isnull().any().any():
        missing = df.isnull().sum()
        missing = missing[missing > 0]
        raise ValueError(f"Missing values detected:\n{missing}")

    if not df["risk_label"].isin([0, 1]).all():
        raise ValueError("risk_label must contain only 0 or 1.")

    if not df["risk_probability"].between(0, 1).all():
        raise ValueError("risk_probability must be between 0 and 1.")

    if not df["compliance_score"].between(0, 100).all():
        raise ValueError("compliance_score must be between 0 and 100.")

    if not df["security_score"].between(0, 100).all():
        raise ValueError("security_score must be between 0 and 100.")

    if not df["sentiment_score"].between(-1, 1).all():
        raise ValueError("sentiment_score must be between -1 and 1.")

    print("Dataset validation passed.")
    print(f"Rows validated: {len(df):,}")
    print(f"Columns validated: {len(df.columns)}")


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]
    dataset_path = project_root / "data" / "vendors.csv"

    if not dataset_path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {dataset_path}"
        )

    df = pd.read_csv(dataset_path)
    validate_dataset(df)


if __name__ == "__main__":
    main()