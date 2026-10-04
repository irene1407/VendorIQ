from pathlib import Path

import pandas as pd

from src.data.validator import validate_dataset


def load_vendor_data(path: str | Path) -> pd.DataFrame:
    """Load and validate VendorIQ vendor data."""

    dataset_path = Path(path)

    if not dataset_path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {dataset_path}"
        )

    df = pd.read_csv(dataset_path)

    validate_dataset(df)

    return df