from pandas.tseries.offsets import MonthEnd
import numpy as np
import pandas as pd

from .model import forecast, train_model


COMMODITIES = {
    "natural_gas_us": {
        "name": "Natural Gas",
        "unit": "$/MMBtu",
    },
    "aluminum": {
        "name": "Aluminum",
        "unit": "$/mt",
    },
    "copper": {
        "name": "Copper",
        "unit": "$/mt",
    },
    "nickel": {
        "name": "Nickel",
        "unit": "$/mt",
    },
    "zinc": {
        "name": "Zinc",
        "unit": "$/mt",
    },
}


PREDICTION_INTERVAL_Z = 1.96
VALIDATION_RATIO = 0.20


def calculate_validation_error(
    values: np.ndarray,
    lags: int,
) -> float:
    """
    Estimate forecast uncertainty using an out-of-sample
    validation period instead of training-set residuals.
    """

    validation_size = max(
        12,
        int(len(values) * VALIDATION_RATIO),
    )

    train_end = len(values) - validation_size

    if train_end <= lags:
        return float(np.std(values))

    train_values = values[:train_end]
    validation_values = values[train_end:]

    validation_model = train_model(
        train_values,
        lags=lags,
    )

    validation_predictions = forecast(
        validation_model,
        train_values,
        periods=len(validation_values),
        lags=lags,
    )

    residuals = (
        validation_values
        - validation_predictions
    )

    residual_std = float(np.std(residuals))

    if not np.isfinite(residual_std) or residual_std <= 0:
        residual_std = float(np.std(values))

    return residual_std


def generate_forecast(
    df: pd.DataFrame,
    commodity: str,
    periods: int = 3,
) -> dict:
    if commodity not in COMMODITIES:
        raise ValueError(
            f"Unknown commodity: {commodity}"
        )

    values = (
        df[commodity]
        .astype(float)
        .to_numpy()
    )

    if len(values) < 13:
        raise ValueError(
            "Not enough historical data for forecasting."
        )

    lags = min(
        12,
        len(values) - 1,
    )

    model = train_model(
        values,
        lags=lags,
    )

    predictions = forecast(
        model,
        values,
        periods=periods,
        lags=lags,
    )

    last_date = pd.Timestamp(
        df["date"].iloc[-1]
    )

    last_value = float(values[-1])

    forecast_dates = [
        last_date + MonthEnd(i + 1)
        for i in range(periods)
    ]

    historical_points = []

    for date, actual in zip(
        df["date"].tail(12),
        values[-12:],
    ):
        historical_points.append(
            {
                "date": pd.Timestamp(date).strftime(
                    "%Y-%m-%d"
                ),
                "actual": round(
                    float(actual),
                    2,
                ),
            }
        )

    residual_std = calculate_validation_error(
        values,
        lags,
    )

    forecast_points = []

    for date, prediction in zip(
        forecast_dates,
        predictions,
    ):
        prediction = float(prediction)

        margin = (
            PREDICTION_INTERVAL_Z
            * residual_std
        )

        lower_bound = max(
            0.0,
            prediction - margin,
        )

        upper_bound = (
            prediction + margin
        )

        forecast_points.append(
            {
                "date": pd.Timestamp(date).strftime(
                    "%Y-%m-%d"
                ),
                "predicted": round(
                    prediction,
                    2,
                ),
                "lowerBound": round(
                    lower_bound,
                    2,
                ),
                "upperBound": round(
                    upper_bound,
                    2,
                ),
            }
        )

    final_prediction = float(
        predictions[-1]
    )

    change = (
        final_prediction
        - last_value
    )

    change_percent = (
        (change / last_value) * 100
        if last_value != 0
        else 0.0
    )

    if change_percent > 2:
        trend = "up"
    elif change_percent < -2:
        trend = "down"
    else:
        trend = "stable"

    return {
        "commodity": COMMODITIES[commodity]["name"],
        "unit": COMMODITIES[commodity]["unit"],
        "currentPrice": round(
            last_value,
            2,
        ),
        "forecastPrice": round(
            final_prediction,
            2,
        ),
        "change": round(
            change,
            2,
        ),
        "changePercent": round(
            change_percent,
            2,
        ),
        "trend": trend,
        "confidence": 0.95,
        "historical": historical_points,
        "forecast": forecast_points,
    }