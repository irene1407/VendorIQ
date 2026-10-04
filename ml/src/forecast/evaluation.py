import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error


def evaluate_forecast(
    actual: np.ndarray,
    predicted: np.ndarray,
) -> dict:
    mae = mean_absolute_error(actual, predicted)
    rmse = np.sqrt(mean_squared_error(actual, predicted))

    return {
        "mae": round(float(mae), 4),
        "rmse": round(float(rmse), 4),
    }