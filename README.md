# 🛡️ FraudShield

## 📌 Problem Statement

Traditional rule-based fraud detection systems catch only **0.0003%** of fraud. Fraudulent transactions make up less than **0.2%** of all transactions — an extreme class imbalance that causes naive classifiers to predict "not fraud" for everything and still score >99% accuracy while catching zero fraud.

FraudShield builds an intelligent ML-based detection system capable of identifying complex fraud patterns that rule-based systems miss.

## 🎯 Objectives

1. Build multiple ML models — Logistic Regression, Random Forest, XGBoost
2. Combine Random Forest & XGBoost into a soft-voting ensemble
3. Optimize classification thresholds via precision-recall tradeoff analysis
4. Deploy the model as a Flask REST API for real-time single and batch predictions
5. Evaluate using AUPRC and F1-score — metrics suited to imbalanced classification
6. Engineer informative features (balance differences, time-based signals, transaction type encoding)

## 📊 Dataset

**PaySim — Simulated Mobile Money Transactions**

| Metric | Value |
|---|---|
| Total transactions | 6.36M |
| Features (raw) | 11 |
| Fraud transactions | 8,213 |
| Overall fraud rate | 0.13% |

| Column | Description |
|---|---|
| `step` | Time step (1 hour per step) |
| `type` | PAYMENT, TRANSFER, CASH_OUT, DEBIT, CASH_IN |
| `amount` | Transaction amount |
| `oldbalanceOrg` / `newbalanceOrig` | Origin account balance before/after |
| `oldbalanceDest` / `newbalanceDest` | Destination account balance before/after |

**Key EDA findings:**
- `TRANSFER` has the highest fraud rate (~0.77%), `CASH_OUT` second (~0.19%). `PAYMENT`, `DEBIT`, `CASH_IN` show zero fraud.
- Fraud peaks during off-peak hours (2–5 AM) → led to the `is_night` feature.
- High multicollinearity: `oldbalanceOrg` ↔ `newbalanceOrig` (r=0.99) and `oldbalanceDest` ↔ `newbalanceDest` (r=0.99) → resolved by replacing raw balances with computed balance-difference features.

## 🛠️ Preprocessing & Feature Engineering

- **Missing values:** Merchant transactions (`nameDest` starting with `M`) have structurally valid zero destination balances — no imputation needed.
- **Split:** Stratified Train (68% / 4.33M) / Validation (12% / 763K) / Test (20% / 1.27M), all preserving the 0.13% fraud rate.
- **Scaling:** `RobustScaler` (median/IQR based, robust to outliers), fit only on the training set to prevent data leakage.
- **Redundant columns removed:** raw balance columns replaced by derived difference features.
- **Encoding:** One-hot encoding for `type` (avoids false ordinal relationships).

| Category | Feature | Formula | Purpose |
|---|---|---|---|
| Time | `hour` | `step % 24` | Hour of day |
| Time | `is_night` | `hour ∈ {0,1,2,3,4,5,22,23}` | Flags peak fraud hours |
| Amount | `log_amount` | `log1p(amount)` | Normalizes skewed distribution |
| Amount | `is_high_amount` | `amount > P99` | Flags very large transactions |
| Balance | `balance_diff_orig` | `oldbalanceOrg − newbalanceOrig` | Strongest fraud signal (47.6% importance) |
| Balance | `balance_diff_dest` | `newbalanceDest − oldbalanceDest` | Abnormal destination activity |
| Balance | `orig_balance_zero_after` | `newbalanceOrig == 0` | Account fully drained |
| Type | `type_CASH_OUT/DEBIT/PAYMENT/TRANSFER` | One-hot | Transaction category |

## ⚖️ Handling Class Imbalance

| Approach | Verdict |
|---|---|
| No handling | ❌ Rejected — 0% recall, catches nothing |
| SMOTE (synthetic oversampling) | ⚠️ Not selected — introduces unrealistic patterns |
| **Class weights** (`class_weight='balanced'`) | ✅ **Selected** — best precision/recall balance, no artificial data |

## 📐 Evaluation Metric — Why AUPRC over ROC-AUC

In imbalanced fraud detection, ROC-AUC is misleading because true negatives dominate its denominator — a model predicting everything as legitimate scores >99% ROC-AUC but 0% AUPRC.

**AUPRC (Area Under Precision-Recall Curve)** is used as the primary metric because it focuses purely on the minority (fraud) class and isn't inflated by true negatives.

## 🤖 Models & Results

Hyperparameters were tuned via `RandomizedSearchCV`, scored on AUPRC, with Stratified K-Fold cross-validation. The validation set was used *exclusively* for threshold tuning, never for training.

| Model | Threshold | Precision | Recall | F1-Score | AUPRC |
|---|---|---|---|---|---|
| Logistic Regression | 0.90 | 14.98% | 84.11% | 0.2543 | 0.6202 |
| Random Forest | 0.65 | 92.54% | 86.79% | 0.8957 | 0.9579 |
| XGBoost | 0.90 | 38.03% | 98.05% | 0.5481 | 0.9201 |
| **Ensemble (RF + XGBoost)** | **0.83** | **94.90%** | **86.00%** | **0.9023** ✅ | **0.9588** ✅ |

**Ensemble = best of both worlds:** Random Forest (bagging) reduces variance; XGBoost (boosting) reduces bias. Soft voting averages their predicted probabilities:

```
ensemble_prob = (rf_prob + xgb_prob) / 2
is_fraud = ensemble_prob >= 0.83
```

**Ensemble confusion matrix** (Test set: 1,272,524 transactions, 1,643 fraud cases):

| | Predicted: Not Fraud | Predicted: Fraud |
|---|---|---|
| **Actual: Not Fraud** | 1,270,805 (TN) | 76 (FP) |
| **Actual: Fraud** | 230 (FN) | 1,413 (TP) |

→ 94.9% precision (only 76 false alarms), 86.0% recall, highest F1-score and AUPRC of all models — recommended for production.

## 🏗️ System Architecture

```
CLIENT APPLICATIONS (Web / Mobile / Banking Systems)
            │
            ▼
   FLASK REST API SERVER
   GET / | GET /model/info | POST /predict | POST /predict/batch
            │
            ▼
   PREDICTION PIPELINE
   1. Input Validation → 2. Feature Engineering → 3. RobustScaler
   → 4. Model Prediction (RF + XGB) → 5. Ensemble Soft Voting
   → 6. Threshold Application
            │
            ▼
   MODEL ARTIFACTS
   fraud_ensemble.pkl (bundles rf_model, xgb_model, scaler, threshold)
            │
            ▼
   OUTPUT: fraud_probability | is_fraud | risk_level | processing_time_ms
```

## 🚀 Getting Started

### Prerequisites

```bash
pip install flask numpy pandas scikit-learn xgboost joblib
```

*(Notebook additionally uses `matplotlib`, `seaborn` for EDA/visualization.)*

### Run the API

```bash
# Place fraud_ensemble.pkl (containing rf_model, xgb_model, scaler, threshold)
# in the same directory as app.py, or set MODEL_PATH env var

export MODEL_PATH=fraud_ensemble.pkl   # optional, this is the default
export PORT=5000                       # optional
python app.py
```

The server starts at `http://0.0.0.0:5000`.

## 📡 API Reference

### `GET /`
Health check.
```json
{ "status": "healthy", "model_loaded": true, "version": "1.0.0" }
```

### `GET /model/info`
Model metadata, performance metrics, valid transaction types, and risk-tier definitions.

### `POST /predict`
Predict fraud for a single transaction.

**Request body:**
```json
{
  "type": "TRANSFER",
  "amount": 9500.00,
  "oldbalanceOrg": 9500.00,
  "newbalanceOrig": 0.00,
  "oldbalanceDest": 0.00,
  "newbalanceDest": 0.00,
  "step": 3
}
```
`type`, `amount`, `oldbalanceOrg`, `newbalanceOrig` are required; the rest are optional.

**Response:**
```json
{
  "status": "success",
  "is_fraud": 1,
  "fraud_probability": 0.993,
  "risk_level": "HIGH",
  "threshold_used": 0.83,
  "rf_probability": 0.987,
  "xgb_probability": 0.9997,
  "engineered_features": { "...": "..." },
  "processing_time_ms": 85.9
}
```

**Risk tiers:**

| Tier | Probability |
|---|---|
| VERY_LOW | < 0.20 |
| LOW | 0.20 – 0.50 |
| MEDIUM | 0.50 – 0.80 |
| HIGH | ≥ 0.80 |

### `POST /predict/batch`
Predict fraud for up to 100 transactions at once.

**Request body:**
```json
{
  "transactions": [
    { "id": "txn_001", "type": "TRANSFER", "amount": 9500.00, "oldbalanceOrg": 9500.00, "newbalanceOrig": 0.00 },
    { "id": "txn_002", "type": "PAYMENT", "amount": 120.00, "oldbalanceOrg": 500.00, "newbalanceOrig": 380.00 }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "total": 2,
  "fraud_count": 1,
  "results": [
    { "id": "txn_001", "status": "success", "is_fraud": 1, "fraud_probability": 0.993, "risk_level": "HIGH" },
    { "id": "txn_002", "status": "success", "is_fraud": 0, "fraud_probability": 0.02, "risk_level": "VERY_LOW" }
  ],
  "processing_time_ms": 45.2
}
```

## 📁 Project Structure

```
.
├── app.py                  # Flask REST API — serves the ensemble model
├── Analysis_Fixed.ipynb    # Full ML pipeline: EDA, feature engineering,
│                            # model training, tuning, and evaluation
├── fraud_ensemble.pkl      # Saved model artifact (rf_model, xgb_model,
│                            # scaler, threshold) — generated by the notebook
└── README.md
```

## ⚠️ Limitations

- **Synthetic dataset:** Trained on PaySim (simulated data) — may not fully capture real-world fraud patterns, adversarial behavior, or institution-specific characteristics.
- **Limited feature set:** Only transaction-level features are available. Signals like device fingerprint, geolocation, user behavior history, and session data could significantly improve performance.
- **Computational cost:** The Random Forest component (~20.3 MB) requires substantial memory for inference at scale; the ensemble adds latency versus a single-model deployment.

## 🔮 Future Scope

1. **Real-time streaming with Apache Kafka** — sub-millisecond latency, parallel processing, automatic scaling during peak load.
2. **Deep learning for sequential analysis** — LSTM/Transformer models to detect multi-transaction fraud patterns over time; autoencoder-based anomaly detection.
3. **Federated learning across banks** — train across institutions without sharing raw data, enabling privacy-preserving, regulation-compliant collective intelligence against emerging fraud schemes.

---
