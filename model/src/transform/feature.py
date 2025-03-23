import pandas as pd

base_dir = "/Users/paulochade/Documents/projects/enter/data/"
window_size = 3

df = pd.read_csv(base_dir + "feature.csv")

for col in df.columns:
    if col != "date":
        df[f"{col}_mean_last_{window_size}"] = (
            df[col].shift(1).rolling(window=window_size).mean()
        )
        df[f"{col}_delta_mean_last_{window_size}"] = (
            df[col] - df[f"{col}_mean_last_{window_size}"]
        )

df = df.round(2)

delta_cols = [col for col in df.columns if f"delta_mean_last_{window_size}" in col]
df = df[["date"] + delta_cols]

df.to_csv("src/data/feature_eng.csv", index=False)
