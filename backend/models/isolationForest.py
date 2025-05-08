import os
import pandas as pd
from sklearn.ensemble import IsolationForest
import sys

def run_isolation_forest(input_file):
    # Read the input CSV file
    df = pd.read_csv(input_file)

    df_clean = df[['Credit', 'Debit', 'Available Balance']]
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    df_scaled = scaler.fit_transform(df_clean)

    # Run Isolation Forest model
    model = IsolationForest(n_estimators=100, contamination=0.1)
    model.fit(df_scaled)
    predictions = model.predict(df_scaled)

    # Add the predictions to the DataFrame
    df['Anomaly'] = predictions

    output_file = os.path.join('processed/', 'updated_' + os.path.basename(input_file))
    df.to_csv(output_file, index=False)

    return output_file

# Get the input CSV file path from the arguments
if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = run_isolation_forest(input_file)
    
    # Confirm the output file actually exists before printing
    if os.path.exists(output_file):
        print(output_file, flush=True)
    else:
        print("FILE_NOT_FOUND:" + output_file, flush=True)