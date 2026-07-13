"""
Fraud Detection Flask API
=========================
Serves predictions from the trained Ensemble (RF + XGBoost) model.
Applies the same feature engineering pipeline used during training.

Endpoints:
  GET  /              → Health check
  GET  /model/info    → Model metadata and feature info
  POST /predict       → Single transaction prediction
  POST /predict/batch → Batch prediction (up to 100 transactions)
"""

import os
import json
import time
import logging
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from datetime import datetime

# ─────────────────────────────────────────────
# Logging setup
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# App initialisation
# ─────────────────────────────────────────────
app = Flask(__name__)

# ─────────────────────────────────────────────
# Load model artifacts at startup
# ─────────────────────────────────────────────
MODEL_PATH   = os.getenv('MODEL_PATH',   'fraud_ensemble.pkl')
SCALER_PATH  = os.getenv('SCALER_PATH',  'fraud_scaler.pkl')

try:
    logger.info(f"Loading ensemble model from: {MODEL_PATH}")
    artifact     = joblib.load(MODEL_PATH)
    rf_model     = artifact['rf_model']
    xgb_model    = artifact['xgb_model']
    threshold    = float(artifact['threshold'])
    scaler       = artifact['scaler']
    logger.info(f"Models loaded successfully. Ensemble threshold = {threshold:.2f}")
except FileNotFoundError as e:
    logger.error(f"Model file not found: {e}")
    logger.error("Place fraud_ensemble.pkl in the same directory as app.py")
    rf_model = xgb_model = scaler = None
    threshold = 0.83

# ─────────────────────────────────────────────
# Constants — must match training notebook exactly
# ─────────────────────────────────────────────
VALID_TYPES    = ['CASH_IN', 'CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER']
P99_THRESHOLD  = 1_000_000   # 99th percentile amount from training data
                              # Update this with the exact value from your notebook output
NIGHT_HOURS    = {0, 1, 2, 3, 4, 5, 22, 23}

# Feature columns expected by the model (same order as training)
FEATURE_COLS = [
    'hour', 'is_night', 'log_amount', 'is_high_amount',
    'balance_diff_orig', 'balance_diff_dest', 'orig_balance_zero_after',
    'type_CASH_OUT', 'type_DEBIT', 'type_PAYMENT', 'type_TRANSFER'
]

# The RobustScaler in the notebook was fitted on ALL 11 feature columns
# (X_train.select_dtypes(include=[np.number]) returns all columns since
# every feature column is numeric after one-hot encoding).
# We must transform ALL 11 columns — not a subset — or sklearn throws
# a shape mismatch error: '>' not supported between float and tuple.
SCALER_COLS = FEATURE_COLS  # all 11 — same order as training


# ─────────────────────────────────────────────
# Feature engineering — mirrors training pipeline exactly
# ─────────────────────────────────────────────
def engineer_features(data: dict) -> pd.DataFrame:
    """
    Apply the same feature engineering as the training notebook.

    Input keys (raw transaction fields):
        type           : str  — CASH_IN / CASH_OUT / DEBIT / PAYMENT / TRANSFER
        amount         : float — transaction amount
        oldbalanceOrg  : float — origin account balance before transaction
        newbalanceOrig : float — origin account balance after transaction
        oldbalanceDest : float — destination account balance before transaction
        newbalanceDest : float — destination account balance after transaction
        step           : int   — time step (hour = step % 24)

    Returns:
        pd.DataFrame with exactly the columns in FEATURE_COLS
    """
    txn_type       = str(data['type']).upper().strip()
    amount         = float(data['amount'])
    old_bal_orig   = float(data['oldbalanceOrg'])
    new_bal_orig   = float(data['newbalanceOrig'])
    old_bal_dest   = float(data.get('oldbalanceDest', 0.0))
    new_bal_dest   = float(data.get('newbalanceDest', 0.0))
    step           = int(data.get('step', 1))

    # Time features
    hour     = step % 24
    is_night = 1 if hour in NIGHT_HOURS else 0

    # Amount features
    log_amount     = np.log1p(amount)
    is_high_amount = 1 if amount > P99_THRESHOLD else 0

    # Balance difference features (key fraud signals)
    balance_diff_orig        = old_bal_orig - new_bal_orig
    balance_diff_dest        = new_bal_dest - old_bal_dest
    orig_balance_zero_after  = 1 if new_bal_orig == 0.0 else 0

    # One-hot encode transaction type (drop_first=True → CASH_IN is the baseline)
    type_cash_out  = 1 if txn_type == 'CASH_OUT'  else 0
    type_debit     = 1 if txn_type == 'DEBIT'     else 0
    type_payment   = 1 if txn_type == 'PAYMENT'   else 0
    type_transfer  = 1 if txn_type == 'TRANSFER'  else 0

    row = {
        'hour'                   : hour,
        'is_night'               : is_night,
        'log_amount'             : log_amount,
        'is_high_amount'         : is_high_amount,
        'balance_diff_orig'      : balance_diff_orig,
        'balance_diff_dest'      : balance_diff_dest,
        'orig_balance_zero_after': orig_balance_zero_after,
        'type_CASH_OUT'          : type_cash_out,
        'type_DEBIT'             : type_debit,
        'type_PAYMENT'           : type_payment,
        'type_TRANSFER'          : type_transfer,
    }

    df = pd.DataFrame([row], columns=FEATURE_COLS)
    return df


def scale_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply the saved RobustScaler to ALL 11 features.
    The scaler was fit_transform(X_train[all_numeric_cols]) in training,
    where all_numeric_cols = X_train.select_dtypes(include=np.number).columns
    = all 11 FEATURE_COLS. Passing only a subset causes the sklearn internal
    validator to raise: TypeError: '>'  not supported between float and tuple.
    """
    df = df.copy()
    df[FEATURE_COLS] = scaler.transform(df[FEATURE_COLS])
    return df


def predict_single(data: dict) -> dict:
    """Run the full prediction pipeline for one transaction."""
    # Feature engineering
    df_features = engineer_features(data)

    # Scale
    df_scaled = scale_features(df_features)

    # Ensemble soft vote (average probabilities)
    rf_prob  = rf_model.predict_proba(df_scaled)[0][1]
    xgb_prob = xgb_model.predict_proba(df_scaled)[0][1]
    ens_prob = (rf_prob + xgb_prob) / 2.0

    # Decision
    is_fraud = int(ens_prob >= threshold)

    # Risk tier
    if ens_prob >= 0.80:
        risk_level = 'HIGH'
    elif ens_prob >= 0.50:
        risk_level = 'MEDIUM'
    elif ens_prob >= 0.20:
        risk_level = 'LOW'
    else:
        risk_level = 'VERY_LOW'

    return {
        'is_fraud'         : is_fraud,
        'fraud_probability': round(float(ens_prob), 6),
        'rf_probability'   : round(float(rf_prob), 6),
        'xgb_probability'  : round(float(xgb_prob), 6),
        'threshold_used'   : threshold,
        'risk_level'       : risk_level,
        'engineered_features': {
            'hour'                   : int(df_features['hour'].iloc[0]),
            'is_night'               : int(df_features['is_night'].iloc[0]),
            'log_amount'             : round(float(df_features['log_amount'].iloc[0]), 4),
            'is_high_amount'         : int(df_features['is_high_amount'].iloc[0]),
            'balance_diff_orig'      : round(float(df_features['balance_diff_orig'].iloc[0]), 2),
            'balance_diff_dest'      : round(float(df_features['balance_diff_dest'].iloc[0]), 2),
            'orig_balance_zero_after': int(df_features['orig_balance_zero_after'].iloc[0]),
            'transaction_type_enc'   : {
                'type_CASH_OUT' : int(df_features['type_CASH_OUT'].iloc[0]),
                'type_DEBIT'    : int(df_features['type_DEBIT'].iloc[0]),
                'type_PAYMENT'  : int(df_features['type_PAYMENT'].iloc[0]),
                'type_TRANSFER' : int(df_features['type_TRANSFER'].iloc[0]),
            }
        }
    }


# ─────────────────────────────────────────────
# Input validation
# ─────────────────────────────────────────────
REQUIRED_FIELDS = ['type', 'amount', 'oldbalanceOrg', 'newbalanceOrig']

def validate_transaction(data: dict) -> list:
    """Return list of error strings. Empty list = valid."""
    errors = []

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"Missing required field: '{field}'")

    if errors:
        return errors

    # Type validation
    txn_type = str(data.get('type', '')).upper().strip()
    if txn_type not in VALID_TYPES:
        errors.append(
            f"Invalid transaction type '{data['type']}'. "
            f"Must be one of: {', '.join(VALID_TYPES)}"
        )

    # Amount validation
    try:
        amount = float(data['amount'])
        if amount < 0:
            errors.append("'amount' must be non-negative")
    except (ValueError, TypeError):
        errors.append("'amount' must be a number")

    # Balance validations
    for field in ['oldbalanceOrg', 'newbalanceOrig']:
        try:
            val = float(data[field])
            if val < 0:
                errors.append(f"'{field}' must be non-negative")
        except (ValueError, TypeError):
            errors.append(f"'{field}' must be a number")

    # Optional balance fields
    for field in ['oldbalanceDest', 'newbalanceDest']:
        if field in data:
            try:
                val = float(data[field])
                if val < 0:
                    errors.append(f"'{field}' must be non-negative")
            except (ValueError, TypeError):
                errors.append(f"'{field}' must be a number")

    # Step validation
    if 'step' in data:
        try:
            step = int(data['step'])
            if step < 1:
                errors.append("'step' must be a positive integer")
        except (ValueError, TypeError):
            errors.append("'step' must be an integer")

    return errors


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint."""
    model_loaded = rf_model is not None and xgb_model is not None
    return jsonify({
        'status'      : 'healthy' if model_loaded else 'degraded',
        'service'     : 'Fraud Detection API',
        'version'     : '1.0.0',
        'model_loaded': model_loaded,
        'timestamp'   : datetime.utcnow().isoformat() + 'Z',
        'endpoints'   : {
            'GET  /'              : 'Health check',
            'GET  /model/info'   : 'Model metadata',
            'POST /predict'      : 'Single transaction prediction',
            'POST /predict/batch': 'Batch prediction (max 100)'
        }
    })


@app.route('/model/info', methods=['GET'])
def model_info():
    """Return model metadata."""
    return jsonify({
        'model_type'       : 'Ensemble (Random Forest + XGBoost) — Soft Voting',
        'ensemble_threshold': threshold,
        'dataset'          : 'PaySim — 6.36M transactions, 0.13% fraud rate',
        'performance'      : {
            'precision' : 0.9490,
            'recall'    : 0.8600,
            'f1_score'  : 0.9023,
            'roc_auc'   : 0.9995,
            'auprc'     : 0.9588,
        },
        'features_used'    : FEATURE_COLS,
        'required_inputs'  : REQUIRED_FIELDS,
        'optional_inputs'  : ['oldbalanceDest', 'newbalanceDest', 'step'],
        'valid_types'      : VALID_TYPES,
        'risk_tiers'       : {
            'VERY_LOW': 'probability < 0.20',
            'LOW'     : '0.20 ≤ probability < 0.50',
            'MEDIUM'  : '0.50 ≤ probability < 0.80',
            'HIGH'    : 'probability ≥ 0.80',
        }
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict fraud for a single transaction.

    Request body (JSON):
    {
        "type"          : "TRANSFER",    ← required
        "amount"        : 9500.00,       ← required
        "oldbalanceOrg" : 9500.00,       ← required
        "newbalanceOrig": 0.00,          ← required
        "oldbalanceDest": 0.00,          ← optional (default 0)
        "newbalanceDest": 0.00,          ← optional (default 0)
        "step"          : 3              ← optional (default 1, hour = step % 24)
    }

    Response:
    {
        "status"            : "success",
        "is_fraud"          : 1,
        "fraud_probability" : 0.923456,
        "risk_level"        : "HIGH",
        "threshold_used"    : 0.83,
        "rf_probability"    : 0.91,
        "xgb_probability"   : 0.94,
        "engineered_features": { ... },
        "processing_time_ms": 12.3
    }
    """
    start_time = time.time()

    # Check models are loaded
    if rf_model is None or xgb_model is None:
        return jsonify({'status': 'error', 'message': 'Models not loaded'}), 503

    # Parse JSON
    if not request.is_json:
        return jsonify({
            'status' : 'error',
            'message': 'Content-Type must be application/json'
        }), 400

    data = request.get_json()
    if data is None:
        return jsonify({'status': 'error', 'message': 'Invalid JSON body'}), 400

    # Validate
    errors = validate_transaction(data)
    if errors:
        return jsonify({
            'status': 'error',
            'message': 'Validation failed',
            'errors': errors
        }), 422

    # Predict
    try:
        result = predict_single(data)
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({'status': 'error', 'message': f'Prediction failed: {str(e)}'}), 500

    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    logger.info(
        f"Prediction | type={data['type']} amount={data['amount']} "
        f"fraud={result['is_fraud']} prob={result['fraud_probability']:.3f} "
        f"time={elapsed_ms}ms"
    )

    return jsonify({
        'status'             : 'success',
        'is_fraud'           : result['is_fraud'],
        'fraud_probability'  : result['fraud_probability'],
        'risk_level'         : result['risk_level'],
        'threshold_used'     : result['threshold_used'],
        'rf_probability'     : result['rf_probability'],
        'xgb_probability'    : result['xgb_probability'],
        'engineered_features': result['engineered_features'],
        'processing_time_ms' : elapsed_ms
    })


@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict fraud for multiple transactions at once (max 100).

    Request body (JSON):
    {
        "transactions": [
            {
                "id"            : "txn_001",   ← optional, returned as-is
                "type"          : "TRANSFER",
                "amount"        : 9500.00,
                "oldbalanceOrg" : 9500.00,
                "newbalanceOrig": 0.00
            },
            { ... }
        ]
    }

    Response:
    {
        "status"       : "success",
        "total"        : 2,
        "fraud_count"  : 1,
        "results"      : [
            {
                "id"               : "txn_001",
                "is_fraud"         : 1,
                "fraud_probability": 0.923,
                "risk_level"       : "HIGH"
            },
            ...
        ],
        "processing_time_ms": 45.2
    }
    """
    start_time = time.time()

    if rf_model is None or xgb_model is None:
        return jsonify({'status': 'error', 'message': 'Models not loaded'}), 503

    if not request.is_json:
        return jsonify({'status': 'error', 'message': 'Content-Type must be application/json'}), 400

    body = request.get_json()
    if body is None or 'transactions' not in body:
        return jsonify({
            'status' : 'error',
            'message': "Request body must contain a 'transactions' array"
        }), 400

    transactions = body['transactions']
    if not isinstance(transactions, list) or len(transactions) == 0:
        return jsonify({'status': 'error', 'message': "'transactions' must be a non-empty array"}), 400

    if len(transactions) > 100:
        return jsonify({
            'status' : 'error',
            'message': f'Batch size {len(transactions)} exceeds maximum of 100'
        }), 400

    results = []
    fraud_count = 0

    for i, txn in enumerate(transactions):
        txn_id = txn.get('id', f'txn_{i+1}')

        errors = validate_transaction(txn)
        if errors:
            results.append({
                'id'    : txn_id,
                'status': 'error',
                'errors': errors
            })
            continue

        try:
            pred = predict_single(txn)
            if pred['is_fraud']:
                fraud_count += 1
            results.append({
                'id'               : txn_id,
                'status'           : 'success',
                'is_fraud'         : pred['is_fraud'],
                'fraud_probability': pred['fraud_probability'],
                'risk_level'       : pred['risk_level'],
            })
        except Exception as e:
            results.append({
                'id'    : txn_id,
                'status': 'error',
                'errors': [str(e)]
            })

    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    logger.info(
        f"Batch prediction | count={len(transactions)} "
        f"fraud_found={fraud_count} time={elapsed_ms}ms"
    )

    return jsonify({
        'status'             : 'success',
        'total'              : len(transactions),
        'fraud_count'        : fraud_count,
        'results'            : results,
        'processing_time_ms' : elapsed_ms
    })


# ─────────────────────────────────────────────
# Error handlers
# ─────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({'status': 'error', 'message': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'status': 'error', 'message': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500


# ─────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    logger.info(f"Starting Fraud Detection API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
