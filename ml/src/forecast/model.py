from typing import Tuple

import numpy as np
from xgboost import XGBRegressor


def create_features(
    values: np.ndarray,
    lags: int = 12,
) -> Tuple[np.ndarray, np.ndarray]:
    X = []
    y = []

    for i in range(lags, len(values)):
        history = values[i - lags:i]

        features = list(history)

        features.append(np.mean(history[-3:]))
        features.append(np.mean(history[-6:]))
        features.append(np.mean(history[-12:]))

        features.append(np.std(history[-3:]))
        features.append(np.std(history[-6:]))
        features.append(np.std(history[-12:]))

        X.append(features)
        y.append(values[i])

    return np.array(X), np.array(y)


def train_model(
    values: np.ndarray,
    lags: int = 12,
) -> XGBRegressor:
    X, y = create_features(values, lags)

    model = XGBRegressor(
        n_estimators=500,
        max_depth=5,
        learning_rate=0.03,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
    )

    model.fit(X, y)

    return model


def forecast(
    model: XGBRegressor,
    values: np.ndarray,
    periods: int,
    lags: int = 12,
) -> np.ndarray:
    history = list(values.astype(float))
    predictions = []

    for _ in range(periods):
        recent = np.array(history[-lags:])

        features = list(recent)

        features.append(np.mean(recent[-3:]))
        features.append(np.mean(recent[-6:]))
        features.append(np.mean(recent[-12:]))

        features.append(np.std(recent[-3:]))
        features.append(np.std(recent[-6:]))
        features.append(np.std(recent[-12:]))

        prediction = float(
            model.predict(
                np.array(features).reshape(1, -1)
            )[0]
        )

        predictions.append(prediction)
        history.append(prediction)

    return np.array(predictions)