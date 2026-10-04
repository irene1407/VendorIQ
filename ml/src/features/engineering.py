import pandas as pd


def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create ML features from raw vendor attributes."""

    features = df.copy()

    # Only use raw vendor attributes for ML.
    # Do NOT include risk_probability, risk_label,
    # risk_category, or manually aggregated risk scores.

    return features