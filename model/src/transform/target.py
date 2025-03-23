import pandas as pd

base_dir = "/Users/paulochade/Documents/projects/enter/data/"

df = pd.read_csv(base_dir + "base.csv")

df["date"] = pd.to_datetime(df["date"], format="%y-%m")

df.sort_values(["type", "date"], inplace=True)

for col in ["conservador", "moderado", "sofisticado"]:
    df[f"{col}_delta"] = df.groupby("type")[col].diff()

df = df[["date", "type", "conservador_delta", "moderado_delta", "sofisticado_delta"]]

df = df.round(2)

df["date"] = df["date"].dt.strftime("%y-%m")  # type: ignore

df.to_csv("src/data/target_eng.csv", index=False)

print("Deltas saved to target_eng.csv")
