import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import LeaveOneOut
import json

window_size = 3

features = pd.read_csv("src/data/feature_eng.csv")
targets = pd.read_csv("src/data/target_eng.csv")

features["date"] = pd.to_datetime(features["date"], format="%y-%m")
targets["date"] = pd.to_datetime(targets["date"], format="%y-%m")

start_date = pd.Timestamp("2023-07-01")
features = features[features["date"] >= start_date].reset_index(drop=True)
targets = targets[targets["date"] >= start_date].reset_index(drop=True)

data = pd.merge(targets, features, on="date", how="inner")

# data = data.dropna(subset=["conservador_delta", "moderado_delta", "sofisticado_delta"])

asset_types = data["type"].unique()
risk_profiles = ["conservador_delta", "moderado_delta", "sofisticado_delta"]
feature_cols = [
    f"ipca_delta_mean_last_{window_size}",
    f"selic_delta_mean_last_{window_size}",
    f"cambio_delta_mean_last_{window_size}",
]

loo = LeaveOneOut()

models_dict = {}

score = 0

for profile in risk_profiles:
    models_dict[profile] = {}
    for asset in asset_types:
        print(f"Training for {profile} | Asset: {asset}")

        subset = data[(data["type"] == asset)].reset_index(drop=True)

        X = subset[feature_cols].values  # type: ignore
        y = subset[profile].values  # type: ignore

        preds, actuals = [], []

        for train_idx, test_idx in loo.split(X):
            X_train, X_test = X[train_idx], X[test_idx]
            y_train, y_test = y[train_idx], y[test_idx]

            model = Ridge(alpha=1.0)
            model.fit(X_train, y_train)
            pred = model.predict(X_test)

            preds.append(pred[0])
            actuals.append(y_test[0])

        mse_model = mean_squared_error(actuals, preds)
        # Baseline: mean prediction
        mean_pred = np.mean(y)  # type: ignore
        baseline_preds = [mean_pred] * len(y)
        mse_baseline = mean_squared_error(y, baseline_preds)

        # Check if the model improves upon the baseline
        if mse_model >= mse_baseline:
            print(
                f"  LOOCV MSE: {mse_model:.4f} (Too big - worse than baseline {mse_baseline:.4f})"
            )
        else:
            score += 1
            print(
                f"  LOOCV MSE: {mse_model:.4f} (Better than baseline {mse_baseline:.4f})"
            )

        final_model = Ridge(alpha=1.0)
        final_model.fit(X, y)

        coef_dict = dict(zip(feature_cols, final_model.coef_))
        coef_dict["intercept"] = final_model.intercept_
        models_dict[profile][asset] = coef_dict

with open("src/model/models.json", "w") as f:
    json.dump(models_dict, f, indent=4)

print("\nAll models saved to models.json successfully.")
print(f"Score: {score}")
