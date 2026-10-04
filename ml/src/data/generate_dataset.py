from pathlib import Path

import numpy as np
import pandas as pd


RANDOM_SEED = 42
N_VENDORS = 10_000


def generate_dataset(n_vendors: int = N_VENDORS) -> pd.DataFrame:
    """Generate a realistic synthetic vendor-risk dataset."""

    rng = np.random.default_rng(RANDOM_SEED)

    df = pd.DataFrame(
        {
            "vendor_id": [
                f"VENDOR-{i:05d}" for i in range(1, n_vendors + 1)
            ],
            # Financial features
            "revenue_growth": rng.normal(0.08, 0.12, n_vendors).clip(-0.40, 0.60),
            "debt_to_equity": rng.lognormal(0.4, 0.65, n_vendors).clip(0.05, 8.0),
            "profit_margin": rng.normal(0.12, 0.08, n_vendors).clip(-0.30, 0.45),
            "cash_flow_ratio": rng.normal(1.2, 0.35, n_vendors).clip(0.1, 3.0),

            # Operational features
            "delivery_delay_rate": rng.beta(2, 12, n_vendors).clip(0, 1),
            "defect_rate": rng.beta(2, 30, n_vendors).clip(0, 1),
            "capacity_utilization": rng.normal(0.72, 0.15, n_vendors).clip(0.20, 1.0),
            "lead_time_variability": rng.gamma(2.0, 4.0, n_vendors).clip(0, 40),

            # Compliance
            "compliance_score": rng.normal(78, 14, n_vendors).clip(0, 100),
            "certification_count": rng.poisson(3, n_vendors).clip(0, 10),
            "regulatory_violations": rng.poisson(0.7, n_vendors).clip(0, 8),

            # Cybersecurity
            "security_incidents": rng.poisson(0.8, n_vendors).clip(0, 10),
            "data_breaches": rng.binomial(2, 0.08, n_vendors),
            "security_score": rng.normal(76, 15, n_vendors).clip(0, 100),

            # Reputation
            "customer_complaints": rng.poisson(8, n_vendors).clip(0, 50),
            "negative_news_count": rng.poisson(2, n_vendors).clip(0, 20),
            "sentiment_score": rng.normal(0.25, 0.35, n_vendors).clip(-1, 1),

            # Geopolitical
            "country_risk_score": rng.normal(35, 20, n_vendors).clip(0, 100),
            "geopolitical_exposure": rng.beta(2, 5, n_vendors).clip(0, 1),
        }
    )

    # Latent risk score.
    # Higher values indicate greater vendor risk.
    risk_score = (
        1.2 * df["debt_to_equity"]
        - 2.5 * df["revenue_growth"]
        - 3.0 * df["profit_margin"]
        - 0.8 * df["cash_flow_ratio"]
        + 5.5 * df["delivery_delay_rate"]
        + 4.0 * df["defect_rate"]
        + 1.5 * df["lead_time_variability"] / 10
        - 0.035 * df["compliance_score"]
        + 0.7 * df["regulatory_violations"]
        + 0.45 * df["security_incidents"]
        + 1.8 * df["data_breaches"]
        - 0.025 * df["security_score"]
        + 0.025 * df["customer_complaints"]
        + 0.10 * df["negative_news_count"]
        - 0.8 * df["sentiment_score"]
        + 0.025 * df["country_risk_score"]
        + 1.5 * df["geopolitical_exposure"]
    )

    # Add realistic noise so the model has to learn rather than
    # perfectly reconstruct a deterministic formula.
    risk_score += rng.normal(0, 1.5, n_vendors)

    # Convert latent score to probability.
    probability = 1 / (1 + np.exp(-(risk_score - 4.5)))

    # Generate binary target.
    df["risk_probability"] = probability
    df["risk_label"] = rng.binomial(1, probability)

    # Add a human-readable risk category.
    df["risk_category"] = np.select(
        [
            df["risk_probability"] >= 0.70,
            df["risk_probability"] >= 0.40,
        ],
        [
            "HIGH",
            "MEDIUM",
        ],
        default="LOW",
    )

    return df


def main() -> None:
    project_root = Path(__file__).resolve().parents[2]
    output_dir = project_root / "data"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / "vendors.csv"

    df = generate_dataset()

    df.to_csv(output_file, index=False)

    print("=" * 60)
    print("VendorIQ synthetic vendor dataset generated successfully")
    print("=" * 60)
    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")
    print(f"Output: {output_file}")
    print()
    print("Risk label distribution:")
    print(df["risk_label"].value_counts())
    print()
    print("Risk category distribution:")
    print(df["risk_category"].value_counts())
    print()
    print("Dataset preview:")
    print(df.head())
    print("=" * 60)


if __name__ == "__main__":
    main()