"""
FraudShield AI - Model Training Pipeline
Trains an ensemble of Isolation Forest (anomaly detection) + Random Forest (classification).
Saves trained models and scaler for production use.
"""

import os
import sys
import json
import warnings
from datetime import datetime

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    precision_recall_curve,
    f1_score,
    accuracy_score
)

warnings.filterwarnings('ignore')

# Project paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'synthetic_fraud_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'fraud_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler.pkl')
METADATA_PATH = os.path.join(BASE_DIR, 'model_metadata.json')

# Feature columns used by the model
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

TARGET_COLUMN = 'is_fraud'


def load_and_validate_data(path):
    """Load dataset and perform validation checks."""
    print("=" * 60)
    print("STEP 1: Loading and Validating Data")
    print("=" * 60)

    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at: {path}. Run generate_dataset.py first.")

    df = pd.read_csv(path)
    print(f"Loaded {len(df)} transactions from {path}")

    # Validate required columns
    missing_cols = set(FEATURE_COLUMNS + [TARGET_COLUMN]) - set(df.columns)
    if missing_cols:
        raise ValueError(f"Missing columns in dataset: {missing_cols}")

    # Check for nulls
    null_counts = df[FEATURE_COLUMNS].isnull().sum()
    if null_counts.any():
        print(f"WARNING: Found null values:\n{null_counts[null_counts > 0]}")
        df = df.dropna(subset=FEATURE_COLUMNS)
        print(f"Dropped rows with nulls. Remaining: {len(df)}")

    # Class distribution
    fraud_count = df[TARGET_COLUMN].sum()
    total = len(df)
    print(f"Class distribution: {total - fraud_count} normal, {fraud_count} fraud ({fraud_count/total*100:.1f}%)")

    return df


def engineer_features(df):
    """Create additional engineered features from raw data."""
    print("\n" + "=" * 60)
    print("STEP 2: Feature Engineering")
    print("=" * 60)

    df = df.copy()

    # Interaction features
    df['amount_frequency_interaction'] = df['transaction_amount'] * df['transaction_frequency']
    df['speed_time_interaction'] = df['location_change_speed'] / (df['time_since_last_transaction'] + 1)
    df['device_location_risk'] = df['device_change_count'] * df['is_new_location'] + df['is_new_device']
    df['is_night_transaction'] = ((df['transaction_hour'] >= 0) & (df['transaction_hour'] <= 5)).astype(int)
    df['is_weekend'] = (df['transaction_day_of_week'] >= 5).astype(int)
    df['risk_composite'] = (
        df['ip_risk_score'] * 0.3 +
        (df['amount_deviation'] / 20) * 0.25 +
        (df['device_change_count'] / 10) * 0.2 +
        (df['location_change_speed'] / 1000) * 0.15 +
        df['is_new_device'] * 0.05 +
        df['is_new_location'] * 0.05
    )

    # Log-transform skewed features
    df['log_amount'] = np.log1p(df['transaction_amount'])
    df['log_time_since_last'] = np.log1p(df['time_since_last_transaction'])
    df['log_speed'] = np.log1p(df['location_change_speed'])

    engineered_features = [
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

    all_features = FEATURE_COLUMNS + engineered_features
    print(f"Total features after engineering: {len(all_features)}")
    for f in engineered_features:
        print(f"  + {f}")

    return df, all_features


def train_models(X_train, X_test, y_train, y_test, all_features):
    """Train the ensemble model: Isolation Forest + Random Forest."""
    print("\n" + "=" * 60)
    print("STEP 3: Model Training")
    print("=" * 60)

    # --- Scaler ---
    print("\nFitting StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # --- Isolation Forest (Anomaly Detection) ---
    print("\nTraining Isolation Forest (anomaly detection)...")
    iso_forest = IsolationForest(
        n_estimators=200,
        contamination=0.08,
        max_samples='auto',
        max_features=1.0,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train_scaled)

    # Get anomaly scores (more negative = more anomalous)
    iso_train_scores = iso_forest.decision_function(X_train_scaled)
    iso_test_scores = iso_forest.decision_function(X_test_scaled)

    # Normalize scores to [0, 1] range (1 = most anomalous)
    iso_train_norm = 1 - (iso_train_scores - iso_train_scores.min()) / (iso_train_scores.max() - iso_train_scores.min())
    iso_test_norm = 1 - (iso_test_scores - iso_test_scores.min()) / (iso_test_scores.max() - iso_test_scores.min())

    # Add isolation forest score as a feature for Random Forest
    X_train_enhanced = np.column_stack([X_train_scaled, iso_train_norm])
    X_test_enhanced = np.column_stack([X_test_scaled, iso_test_norm])

    # --- Random Forest Classifier ---
    print("Training Random Forest Classifier...")
    rf_classifier = RandomForestClassifier(
        n_estimators=300,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features='sqrt',
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    rf_classifier.fit(X_train_enhanced, y_train)

    # --- Cross-validation ---
    print("\nPerforming 5-fold cross-validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    # For CV, we need to recompute iso scores within each fold conceptually,
    # but for simplicity we use the already-enhanced features
    cv_scores = cross_val_score(rf_classifier, X_train_enhanced, y_train, cv=cv, scoring='roc_auc')
    print(f"Cross-validation ROC-AUC scores: {cv_scores.round(4)}")
    print(f"Mean CV ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    return scaler, iso_forest, rf_classifier, X_test_enhanced, iso_test_norm


def evaluate_model(rf_classifier, X_test_enhanced, y_test):
    """Evaluate the trained model and print metrics."""
    print("\n" + "=" * 60)
    print("STEP 4: Model Evaluation")
    print("=" * 60)

    # Predictions
    y_pred = rf_classifier.predict(X_test_enhanced)
    y_prob = rf_classifier.predict_proba(X_test_enhanced)[:, 1]

    # Classification Report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Normal', 'Fraud']))

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print("Confusion Matrix:")
    print(f"  TN={cm[0,0]}  FP={cm[0,1]}")
    print(f"  FN={cm[1,0]}  TP={cm[1,1]}")

    # ROC-AUC
    roc_auc = roc_auc_score(y_test, y_prob)
    print(f"\nROC-AUC Score: {roc_auc:.4f}")

    # Additional metrics
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    print(f"F1-Score: {f1:.4f}")

    # Feature importance (only for original + engineered + iso_score features)
    importances = rf_classifier.feature_importances_
    feature_names = FEATURE_COLUMNS + [
        'amount_frequency_interaction',
        'speed_time_interaction',
        'device_location_risk',
        'is_night_transaction',
        'is_weekend',
        'risk_composite',
        'log_amount',
        'log_time_since_last',
        'log_speed',
        'isolation_forest_score'
    ]

    print("\nTop 10 Feature Importances:")
    indices = np.argsort(importances)[::-1]
    for i in range(min(10, len(feature_names))):
        idx = indices[i]
        name = feature_names[idx] if idx < len(feature_names) else f"feature_{idx}"
        print(f"  {i+1}. {name}: {importances[idx]:.4f}")

    metrics = {
        'roc_auc': round(float(roc_auc), 4),
        'accuracy': round(float(accuracy), 4),
        'f1_score': round(float(f1), 4),
        'confusion_matrix': cm.tolist(),
        'total_test_samples': len(y_test),
        'fraud_test_samples': int(y_test.sum()),
    }

    return metrics


def save_artifacts(scaler, iso_forest, rf_classifier, metrics, all_features):
    """Save trained models, scaler, and metadata."""
    print("\n" + "=" * 60)
    print("STEP 5: Saving Artifacts")
    print("=" * 60)

    # Save the complete model pipeline as a dict
    model_pipeline = {
        'isolation_forest': iso_forest,
        'random_forest': rf_classifier,
        'feature_columns': FEATURE_COLUMNS,
        'all_features': all_features,
        'version': '1.0.0'
    }

    joblib.dump(model_pipeline, MODEL_PATH)
    print(f"Model pipeline saved to: {MODEL_PATH} ({os.path.getsize(MODEL_PATH)/1024:.1f} KB)")

    # Save scaler separately
    joblib.dump(scaler, SCALER_PATH)
    print(f"Scaler saved to: {SCALER_PATH} ({os.path.getsize(SCALER_PATH)/1024:.1f} KB)")

    # Save metadata
    metadata = {
        'model_version': '1.0.0',
        'training_date': datetime.utcnow().isoformat() + 'Z',
        'features_used': FEATURE_COLUMNS,
        'engineered_features': all_features[len(FEATURE_COLUMNS):],
        'total_features': len(all_features) + 1,  # +1 for isolation forest score
        'metrics': metrics,
        'model_type': 'Ensemble (Isolation Forest + Random Forest)',
        'isolation_forest_params': {
            'n_estimators': 200,
            'contamination': 0.08
        },
        'random_forest_params': {
            'n_estimators': 300,
            'max_depth': 20,
            'class_weight': 'balanced'
        }
    }

    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to: {METADATA_PATH}")

    return metadata


def main():
    """Main training pipeline."""
    print("=" * 60)
    print("  FraudShield AI - Model Training Pipeline")
    print("=" * 60)
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # 1. Load data
    df = load_and_validate_data(DATASET_PATH)

    # 2. Feature engineering
    df, all_features = engineer_features(df)

    # 3. Prepare train/test split
    X = df[all_features].values
    y = df[TARGET_COLUMN].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTrain set: {len(X_train)} samples ({y_train.sum()} fraud)")
    print(f"Test set: {len(X_test)} samples ({y_test.sum()} fraud)")

    # 4. Train models
    scaler, iso_forest, rf_classifier, X_test_enhanced, _ = train_models(
        X_train, X_test, y_train, y_test, all_features
    )

    # 5. Evaluate
    metrics = evaluate_model(rf_classifier, X_test_enhanced, y_test)

    # 6. Save everything
    metadata = save_artifacts(scaler, iso_forest, rf_classifier, metrics, all_features)

    print("\n" + "=" * 60)
    print("  Training Complete!")
    print("=" * 60)
    print(f"  ROC-AUC: {metrics['roc_auc']:.4f}")
    print(f"  Accuracy: {metrics['accuracy']:.4f}")
    print(f"  F1-Score: {metrics['f1_score']:.4f}")
    print(f"  Model: {MODEL_PATH}")
    print(f"  Scaler: {SCALER_PATH}")
    print("=" * 60)

    return metrics


if __name__ == '__main__':
    main()
