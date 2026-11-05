"""
FraudShield AI - Flask API Server
Production-ready fraud detection API with ML-powered analysis.
"""

import os
import sys
import json
import traceback
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

# =============================================================================
# Configuration
# =============================================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'fraud_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler.pkl')
METADATA_PATH = os.path.join(BASE_DIR, 'model_metadata.json')

FEATURE_COLUMNS = [
    'transaction_amount',
    'transaction_hour',
    'transaction_day_of_week',
    'transaction_frequency',
    'location_change_speed',
    'device_change_count',
    'is_international',
    'amount_deviation',
    'time_since_last_transaction',
    'ip_risk_score',
    'is_new_device',
    'is_new_location'
]

# Default values for missing fields
FEATURE_DEFAULTS = {
    'transaction_amount': 100.0,
    'transaction_hour': 12,
    'transaction_day_of_week': 2,
    'transaction_frequency': 3,
    'location_change_speed': 20.0,
    'device_change_count': 0,
    'is_international': 0,
    'amount_deviation': 0.5,
    'time_since_last_transaction': 120.0,
    'ip_risk_score': 0.1,
    'is_new_device': 0,
    'is_new_location': 0
}

# =============================================================================
# App Initialization
# =============================================================================

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global model objects
model_pipeline = None
scaler = None
model_metadata = None


def load_models():
    """Load trained models and metadata into memory."""
    global model_pipeline, scaler, model_metadata

    try:
        if not os.path.exists(MODEL_PATH):
            print(f"WARNING: Model file not found at {MODEL_PATH}")
            return False

        if not os.path.exists(SCALER_PATH):
            print(f"WARNING: Scaler file not found at {SCALER_PATH}")
            return False

        model_pipeline = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)

        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, 'r') as f:
                model_metadata = json.load(f)
        else:
            model_metadata = {
                'model_version': '1.0.0',
                'training_date': 'unknown',
                'metrics': {}
            }

        print("Models loaded successfully!")
        print(f"  Model version: {model_metadata.get('model_version', 'unknown')}")
        print(f"  Training date: {model_metadata.get('training_date', 'unknown')}")
        return True

    except Exception as e:
        print(f"ERROR loading models: {e}")
        traceback.print_exc()
        return False


def engineer_features_single(features_dict):
    """Apply the same feature engineering as training to a single transaction."""
    f = features_dict.copy()

    f['amount_frequency_interaction'] = f['transaction_amount'] * f['transaction_frequency']
    f['speed_time_interaction'] = f['location_change_speed'] / (f['time_since_last_transaction'] + 1)
    f['device_location_risk'] = f['device_change_count'] * f['is_new_location'] + f['is_new_device']
    f['is_night_transaction'] = 1 if 0 <= f['transaction_hour'] <= 5 else 0
    f['is_weekend'] = 1 if f['transaction_day_of_week'] >= 5 else 0
    f['risk_composite'] = (
        f['ip_risk_score'] * 0.3 +
        (f['amount_deviation'] / 20) * 0.25 +
        (f['device_change_count'] / 10) * 0.2 +
        (f['location_change_speed'] / 1000) * 0.15 +
        f['is_new_device'] * 0.05 +
        f['is_new_location'] * 0.05
    )
    f['log_amount'] = np.log1p(f['transaction_amount'])
    f['log_time_since_last'] = np.log1p(f['time_since_last_transaction'])
    f['log_speed'] = np.log1p(f['location_change_speed'])

    return f


def extract_features(data):
    """Extract and validate features from request data, applying defaults for missing fields."""
    features = {}
    for col in FEATURE_COLUMNS:
        value = data.get(col, data.get(to_camel_case(col), None))
        if value is None:
            features[col] = FEATURE_DEFAULTS[col]
        else:
            try:
                features[col] = float(value)
            except (ValueError, TypeError):
                features[col] = FEATURE_DEFAULTS[col]

    # Clamp values to valid ranges
    features['transaction_amount'] = max(0, features['transaction_amount'])
    features['transaction_hour'] = int(np.clip(features['transaction_hour'], 0, 23))
    features['transaction_day_of_week'] = int(np.clip(features['transaction_day_of_week'], 0, 6))
    features['transaction_frequency'] = max(1, int(features['transaction_frequency']))
    features['location_change_speed'] = max(0, features['location_change_speed'])
    features['device_change_count'] = max(0, int(features['device_change_count']))
    features['is_international'] = 1 if features['is_international'] >= 0.5 else 0
    features['amount_deviation'] = max(0, features['amount_deviation'])
    features['time_since_last_transaction'] = max(0, features['time_since_last_transaction'])
    features['ip_risk_score'] = float(np.clip(features['ip_risk_score'], 0, 1))
    features['is_new_device'] = 1 if features['is_new_device'] >= 0.5 else 0
    features['is_new_location'] = 1 if features['is_new_location'] >= 0.5 else 0

    return features


def to_camel_case(snake_str):
    """Convert snake_case to camelCase."""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def generate_reasons(features):
    """
    Generate explainable AI reasons based on actual feature thresholds.
    Each reason is derived from analyzing the transaction's features.
    """
    reasons = []

    # 1. Unusually high transaction amount
    if features['transaction_amount'] > 3000:
        reasons.append(f"Unusually high transaction amount (${features['transaction_amount']:.2f})")
    elif features['transaction_amount'] > 1500:
        reasons.append(f"Above-average transaction amount (${features['transaction_amount']:.2f})")

    # 2. High amount deviation from user average
    if features['amount_deviation'] > 4:
        reasons.append(f"Transaction amount deviates significantly from user average ({features['amount_deviation']:.1f} std devs)")
    elif features['amount_deviation'] > 2:
        reasons.append(f"Transaction amount above user's typical range ({features['amount_deviation']:.1f} std devs)")

    # 3. Unusual transaction time (2-5 AM)
    if 2 <= features['transaction_hour'] <= 5:
        reasons.append(f"Transaction at unusual hour ({features['transaction_hour']}:00 - late night/early morning)")
    elif features['transaction_hour'] <= 1 or features['transaction_hour'] >= 23:
        reasons.append(f"Transaction at late hour ({features['transaction_hour']}:00)")

    # 4. Rapid location change (impossible travel)
    if features['location_change_speed'] > 500:
        reasons.append(f"Impossibly fast location change ({features['location_change_speed']:.0f} km/h - possible location spoofing)")
    elif features['location_change_speed'] > 200:
        reasons.append(f"Rapid location change detected ({features['location_change_speed']:.0f} km/h)")

    # 5. High transaction frequency
    if features['transaction_frequency'] > 15:
        reasons.append(f"Very high transaction frequency ({features['transaction_frequency']} transactions in 24h)")
    elif features['transaction_frequency'] > 10:
        reasons.append(f"Elevated transaction frequency ({features['transaction_frequency']} transactions in 24h)")

    # 6. New device
    if features['is_new_device'] == 1:
        reasons.append("Transaction from a previously unseen device")

    # 7. Multiple device changes
    if features['device_change_count'] >= 4:
        reasons.append(f"Multiple device changes in past 7 days ({features['device_change_count']} changes)")
    elif features['device_change_count'] >= 2:
        reasons.append(f"Device switching detected ({features['device_change_count']} changes in 7 days)")

    # 8. New location
    if features['is_new_location'] == 1:
        reasons.append("Transaction from an unfamiliar location")

    # 9. International transaction
    if features['is_international'] == 1:
        reasons.append("International transaction detected")

    # 10. Very short time since last transaction
    if features['time_since_last_transaction'] < 1:
        reasons.append(f"Extremely rapid successive transaction ({features['time_since_last_transaction']:.1f} minutes since last)")
    elif features['time_since_last_transaction'] < 5:
        reasons.append(f"Very short interval between transactions ({features['time_since_last_transaction']:.1f} minutes)")

    # 11. High IP risk score
    if features['ip_risk_score'] > 0.6:
        reasons.append(f"High-risk IP address detected (risk score: {features['ip_risk_score']:.2f})")
    elif features['ip_risk_score'] > 0.3:
        reasons.append(f"Moderate IP risk score ({features['ip_risk_score']:.2f})")

    # If no specific reasons found, note it's within normal parameters
    if not reasons:
        reasons.append("Transaction parameters within normal ranges")

    return reasons


def predict_fraud(features_dict):
    """
    Run the fraud detection pipeline on a single transaction.

    Returns:
        dict with riskScore, riskLevel, prediction, reasons, confidence
    """
    if model_pipeline is None or scaler is None:
        raise RuntimeError("Models not loaded. Please ensure fraud_model.pkl and scaler.pkl exist.")

    # Apply feature engineering
    engineered = engineer_features_single(features_dict)

    # Build feature vector in correct order
    all_feature_names = FEATURE_COLUMNS + [
        'amount_frequency_interaction',
        'speed_time_interaction',
        'device_location_risk',
        'is_night_transaction',
        'is_weekend',
        'risk_composite',
        'log_amount',
        'log_time_since_last',
        'log_speed'
    ]

    feature_vector = np.array([[engineered[f] for f in all_feature_names]])

    # Scale features
    feature_scaled = scaler.transform(feature_vector)

    # Get Isolation Forest anomaly score
    iso_forest = model_pipeline['isolation_forest']
    iso_score = iso_forest.decision_function(feature_scaled)[0]

    # Normalize isolation forest score to [0, 1] (1 = most anomalous)
    # Use empirical bounds: typical range is approximately [-0.5, 0.5]
    iso_normalized = 1 - (iso_score - (-0.5)) / (0.5 - (-0.5))
    iso_normalized = float(np.clip(iso_normalized, 0, 1))

    # Add isolation forest score to feature vector
    feature_enhanced = np.column_stack([feature_scaled, [[iso_normalized]]])

    # Get Random Forest prediction
    rf = model_pipeline['random_forest']
    rf_prob = rf.predict_proba(feature_enhanced)[0]
    fraud_probability = float(rf_prob[1])

    # Combine scores: weighted ensemble
    # 70% Random Forest probability + 30% Isolation Forest anomaly score
    combined_score = 0.7 * fraud_probability + 0.3 * iso_normalized
    risk_score = int(np.clip(combined_score * 100, 0, 100))

    # Classify risk level
    if risk_score <= 30:
        risk_level = "LOW"
        prediction = "Normal Transaction"
    elif risk_score <= 70:
        risk_level = "MEDIUM"
        prediction = "Suspicious Transaction"
    else:
        risk_level = "HIGH"
        prediction = "Potential Fraud"

    # Generate explainable reasons
    reasons = generate_reasons(features_dict)

    # Confidence is the max probability from the RF classifier
    confidence = round(float(max(rf_prob)), 4)

    return {
        'riskScore': risk_score,
        'riskLevel': risk_level,
        'prediction': prediction,
        'reasons': reasons,
        'confidence': confidence,
        'fraudProbability': round(fraud_probability, 4),
        'anomalyScore': round(iso_normalized, 4),
        'modelVersion': model_metadata.get('model_version', '1.0.0')
    }


# =============================================================================
# API Endpoints
# =============================================================================

@app.route('/api/fraud/health', methods=['GET'])
def health_check():
    """Health check endpoint returning model status."""
    model_loaded = model_pipeline is not None and scaler is not None
    return jsonify({
        'status': 'healthy' if model_loaded else 'degraded',
        'modelLoaded': model_loaded,
        'modelVersion': model_metadata.get('model_version', 'unknown') if model_metadata else 'unknown',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'service': 'FraudShield AI - ML Service',
        'port': 5001
    }), 200 if model_loaded else 503


@app.route('/api/fraud/analyze', methods=['POST'])
def analyze_transaction():
    """Analyze a single transaction for fraud."""
    try:
        if model_pipeline is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'The fraud detection model is not available. Please train the model first.'
            }), 503

        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be valid JSON'
            }), 400

        # Extract transaction ID
        transaction_id = data.get('transactionId', data.get('transaction_id', f'TXN-{datetime.now().strftime("%Y%m%d%H%M%S")}'))

        # Extract and validate features
        features = extract_features(data)

        # Run prediction
        result = predict_fraud(features)

        response = {
            'transactionId': transaction_id,
            'riskScore': result['riskScore'],
            'riskLevel': result['riskLevel'],
            'prediction': result['prediction'],
            'reasons': result['reasons'],
            'confidence': result['confidence'],
            'fraudProbability': result['fraudProbability'],
            'anomalyScore': result['anomalyScore'],
            'modelVersion': result['modelVersion'],
            'analyzedAt': datetime.now(timezone.utc).isoformat()
        }

        return jsonify(response), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e)
        }), 500


@app.route('/api/fraud/batch-analyze', methods=['POST'])
def batch_analyze():
    """Analyze multiple transactions in batch."""
    try:
        if model_pipeline is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'The fraud detection model is not available.'
            }), 503

        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be valid JSON'
            }), 400

        # Accept either a list directly or {"transactions": [...]}
        if isinstance(data, list):
            transactions = data
        elif isinstance(data, dict) and 'transactions' in data:
            transactions = data['transactions']
        else:
            return jsonify({
                'error': 'Invalid format',
                'message': 'Expected a JSON array or {"transactions": [...]}'
            }), 400

        if not isinstance(transactions, list) or len(transactions) == 0:
            return jsonify({
                'error': 'Invalid format',
                'message': 'Transactions must be a non-empty array'
            }), 400

        if len(transactions) > 1000:
            return jsonify({
                'error': 'Batch too large',
                'message': 'Maximum batch size is 1000 transactions'
            }), 400

        results = []
        errors = []

        for i, txn in enumerate(transactions):
            try:
                transaction_id = txn.get('transactionId', txn.get('transaction_id', f'BATCH-{i+1}'))
                features = extract_features(txn)
                result = predict_fraud(features)
                results.append({
                    'transactionId': transaction_id,
                    'riskScore': result['riskScore'],
                    'riskLevel': result['riskLevel'],
                    'prediction': result['prediction'],
                    'reasons': result['reasons'],
                    'confidence': result['confidence'],
                    'fraudProbability': result['fraudProbability'],
                    'anomalyScore': result['anomalyScore'],
                    'modelVersion': result['modelVersion'],
                    'analyzedAt': datetime.now(timezone.utc).isoformat()
                })
            except Exception as e:
                errors.append({
                    'index': i,
                    'transactionId': txn.get('transactionId', f'BATCH-{i+1}'),
                    'error': str(e)
                })

        response = {
            'totalProcessed': len(results),
            'totalErrors': len(errors),
            'results': results,
            'errors': errors if errors else None,
            'summary': {
                'highRisk': sum(1 for r in results if r['riskLevel'] == 'HIGH'),
                'mediumRisk': sum(1 for r in results if r['riskLevel'] == 'MEDIUM'),
                'lowRisk': sum(1 for r in results if r['riskLevel'] == 'LOW'),
                'averageRiskScore': round(sum(r['riskScore'] for r in results) / max(len(results), 1), 1)
            },
            'analyzedAt': datetime.now(timezone.utc).isoformat()
        }

        return jsonify(response), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'error': 'Batch analysis failed',
            'message': str(e)
        }), 500


@app.route('/api/fraud/model-info', methods=['GET'])
def model_info():
    """Return model metadata including version, accuracy, features, and training date."""
    try:
        if model_metadata is None:
            return jsonify({
                'error': 'Model metadata not available',
                'message': 'No model metadata found. Train the model first.'
            }), 503

        metrics = model_metadata.get('metrics', {})

        response = {
            'modelVersion': model_metadata.get('model_version', 'unknown'),
            'modelType': model_metadata.get('model_type', 'Ensemble (Isolation Forest + Random Forest)'),
            'trainingDate': model_metadata.get('training_date', 'unknown'),
            'featuresUsed': model_metadata.get('features_used', FEATURE_COLUMNS),
            'engineeredFeatures': model_metadata.get('engineered_features', []),
            'totalFeatures': model_metadata.get('total_features', len(FEATURE_COLUMNS)),
            'performance': {
                'rocAuc': metrics.get('roc_auc', None),
                'accuracy': metrics.get('accuracy', None),
                'f1Score': metrics.get('f1_score', None),
                'testSamples': metrics.get('total_test_samples', None),
                'fraudTestSamples': metrics.get('fraud_test_samples', None)
            },
            'modelComponents': {
                'isolationForest': model_metadata.get('isolation_forest_params', {}),
                'randomForest': model_metadata.get('random_forest_params', {})
            },
            'riskThresholds': {
                'low': '0-30',
                'medium': '31-70',
                'high': '71-100'
            }
        }

        return jsonify(response), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to retrieve model info',
            'message': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Not Found',
        'message': 'The requested endpoint does not exist.',
        'availableEndpoints': [
            'POST /api/fraud/analyze',
            'POST /api/fraud/batch-analyze',
            'GET /api/fraud/health',
            'GET /api/fraud/model-info'
        ]
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors."""
    return jsonify({
        'error': 'Method Not Allowed',
        'message': 'This HTTP method is not supported for the requested endpoint.'
    }), 405


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred. Please try again later.'
    }), 500


# =============================================================================
# Entry Point
# =============================================================================

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("  FraudShield AI - ML Service Starting")
    print("=" * 60)

    # Load models at startup
    models_loaded = load_models()
    if not models_loaded:
        print("\nWARNING: Models not loaded. Run train_model.py first.")
        print("The API will start but predictions will be unavailable.\n")

    print(f"\nStarting Flask server on port 5001...")
    print("Endpoints:")
    print("  POST /api/fraud/analyze       - Analyze single transaction")
    print("  POST /api/fraud/batch-analyze  - Batch analysis")
    print("  GET  /api/fraud/health         - Health check")
    print("  GET  /api/fraud/model-info     - Model metadata")
    print("=" * 60 + "\n")

    app.run(
        host='0.0.0.0',
        port=5001,
        debug=False
    )
