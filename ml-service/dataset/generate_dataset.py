"""
FraudShield AI - Synthetic Fraud Detection Dataset Generator
Generates 10,000+ realistic transactions with ~8% fraud rate.
"""

import numpy as np
import pandas as pd
import os
import sys


def generate_normal_transaction(rng):
    """Generate a single normal (non-fraudulent) transaction."""
    # Normal transactions: typical amounts, business hours, reasonable patterns
    amount = rng.lognormal(mean=4.5, sigma=1.0)  # Centered around ~90, skewed right
    amount = np.clip(amount, 10, 5000)

    # Normal hours: weighted toward business hours (9-21)
    hour = int(rng.choice(
        range(24),
        p=[0.01, 0.01, 0.005, 0.005, 0.005, 0.005, 0.02, 0.03, 0.05, 0.07,
           0.08, 0.08, 0.08, 0.07, 0.06, 0.06, 0.05, 0.05, 0.04, 0.04,
           0.03, 0.03, 0.02, 0.01]
    ))

    day_of_week = int(rng.integers(0, 7))
    frequency = int(rng.poisson(lam=3) + 1)  # Avg 3-4 transactions/day
    frequency = min(frequency, 15)

    # Normal location changes: walking/driving speed
    location_change_speed = float(rng.exponential(scale=30))
    location_change_speed = np.clip(location_change_speed, 0, 200)

    device_change_count = int(rng.choice([0, 1, 2], p=[0.6, 0.3, 0.1]))
    is_international = int(rng.choice([0, 1], p=[0.9, 0.1]))

    # Amount deviation: usually close to user's average
    amount_deviation = float(abs(rng.normal(0, 0.8)))
    amount_deviation = np.clip(amount_deviation, 0, 3)

    # Time since last transaction: usually hours apart
    time_since_last = float(rng.exponential(scale=120))  # Avg 2 hours
    time_since_last = np.clip(time_since_last, 5, 10000)

    ip_risk_score = float(rng.beta(2, 20))  # Skewed toward low risk
    is_new_device = int(rng.choice([0, 1], p=[0.92, 0.08]))
    is_new_location = int(rng.choice([0, 1], p=[0.85, 0.15]))

    return {
        'transaction_amount': round(amount, 2),
        'transaction_hour': hour,
        'transaction_day_of_week': day_of_week,
        'transaction_frequency': frequency,
        'location_change_speed': round(location_change_speed, 2),
        'device_change_count': device_change_count,
        'is_international': is_international,
        'amount_deviation': round(amount_deviation, 2),
        'time_since_last_transaction': round(time_since_last, 2),
        'ip_risk_score': round(ip_risk_score, 4),
        'is_new_device': is_new_device,
        'is_new_location': is_new_location,
        'is_fraud': 0
    }


def generate_fraudulent_transaction(rng):
    """Generate a single fraudulent transaction with realistic fraud patterns."""
    fraud_type = rng.choice(['high_amount', 'rapid_fire', 'location_hopping',
                              'device_fraud', 'identity_theft', 'mixed'])

    # Start with baseline values
    txn = generate_normal_transaction(rng)
    txn['is_fraud'] = 1

    if fraud_type == 'high_amount':
        # Unusually high amounts or very specific round numbers
        txn['transaction_amount'] = round(float(rng.uniform(3000, 15000)), 2)
        txn['amount_deviation'] = round(float(rng.uniform(3, 15)), 2)
        txn['transaction_hour'] = int(rng.choice([0, 1, 2, 3, 4, 5, 22, 23]))
        txn['ip_risk_score'] = round(float(rng.uniform(0.3, 0.9)), 4)

    elif fraud_type == 'rapid_fire':
        # Many transactions in rapid succession
        txn['transaction_frequency'] = int(rng.integers(12, 50))
        txn['time_since_last_transaction'] = round(float(rng.uniform(0.1, 2)), 2)
        txn['transaction_amount'] = round(float(rng.uniform(50, 2000)), 2)
        txn['ip_risk_score'] = round(float(rng.uniform(0.2, 0.7)), 4)

    elif fraud_type == 'location_hopping':
        # Impossible travel speed between transactions
        txn['location_change_speed'] = round(float(rng.uniform(500, 1000)), 2)
        txn['is_new_location'] = 1
        txn['is_international'] = int(rng.choice([0, 1], p=[0.3, 0.7]))
        txn['time_since_last_transaction'] = round(float(rng.uniform(10, 60)), 2)

    elif fraud_type == 'device_fraud':
        # Multiple device changes, new device
        txn['device_change_count'] = int(rng.integers(4, 10))
        txn['is_new_device'] = 1
        txn['is_new_location'] = 1
        txn['ip_risk_score'] = round(float(rng.uniform(0.4, 0.95)), 4)

    elif fraud_type == 'identity_theft':
        # Combination of unusual patterns
        txn['transaction_hour'] = int(rng.choice([0, 1, 2, 3, 4, 5]))
        txn['is_new_device'] = 1
        txn['is_new_location'] = 1
        txn['is_international'] = 1
        txn['amount_deviation'] = round(float(rng.uniform(4, 20)), 2)
        txn['transaction_amount'] = round(float(rng.uniform(1000, 10000)), 2)
        txn['ip_risk_score'] = round(float(rng.uniform(0.5, 1.0)), 4)

    else:  # mixed
        # Multiple fraud signals combined
        txn['transaction_amount'] = round(float(rng.uniform(2000, 8000)), 2)
        txn['transaction_hour'] = int(rng.choice([0, 1, 2, 3, 4, 22, 23]))
        txn['transaction_frequency'] = int(rng.integers(8, 30))
        txn['location_change_speed'] = round(float(rng.uniform(300, 800)), 2)
        txn['device_change_count'] = int(rng.integers(3, 8))
        txn['amount_deviation'] = round(float(rng.uniform(3, 12)), 2)
        txn['time_since_last_transaction'] = round(float(rng.uniform(0.5, 10)), 2)
        txn['ip_risk_score'] = round(float(rng.uniform(0.4, 0.9)), 4)
        txn['is_new_device'] = int(rng.choice([0, 1], p=[0.3, 0.7]))
        txn['is_new_location'] = int(rng.choice([0, 1], p=[0.2, 0.8]))

    return txn


def generate_dataset(n_total=12000, fraud_rate=0.08, seed=42):
    """
    Generate the complete synthetic fraud detection dataset.

    Args:
        n_total: Total number of transactions to generate.
        fraud_rate: Approximate fraction of fraudulent transactions.
        seed: Random seed for reproducibility.

    Returns:
        pd.DataFrame with all transaction features and labels.
    """
    rng = np.random.default_rng(seed)

    n_fraud = int(n_total * fraud_rate)
    n_normal = n_total - n_fraud

    print(f"Generating {n_total} transactions ({n_normal} normal, {n_fraud} fraudulent)...")

    transactions = []

    # Generate normal transactions
    for _ in range(n_normal):
        transactions.append(generate_normal_transaction(rng))

    # Generate fraudulent transactions
    for _ in range(n_fraud):
        transactions.append(generate_fraudulent_transaction(rng))

    df = pd.DataFrame(transactions)

    # Shuffle the dataset
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)

    # Validate data ranges
    assert df['transaction_hour'].between(0, 23).all(), "Invalid transaction_hour values"
    assert df['transaction_day_of_week'].between(0, 6).all(), "Invalid day_of_week values"
    assert df['is_fraud'].isin([0, 1]).all(), "Invalid is_fraud values"
    assert df['is_international'].isin([0, 1]).all(), "Invalid is_international values"
    assert df['is_new_device'].isin([0, 1]).all(), "Invalid is_new_device values"
    assert df['is_new_location'].isin([0, 1]).all(), "Invalid is_new_location values"

    return df


def main():
    """Generate and save the synthetic fraud dataset."""
    df = generate_dataset(n_total=12000, fraud_rate=0.08, seed=42)

    # Print dataset statistics
    print("\n=== Dataset Statistics ===")
    print(f"Total transactions: {len(df)}")
    print(f"Fraudulent: {df['is_fraud'].sum()} ({df['is_fraud'].mean()*100:.1f}%)")
    print(f"Legitimate: {(1-df['is_fraud']).sum():.0f} ({(1-df['is_fraud']).mean()*100:.1f}%)")
    print(f"\nFeature summary:")
    print(df.describe().round(2).to_string())
    print(f"\nFraud vs Normal - Mean comparison:")
    comparison = df.groupby('is_fraud').mean(numeric_only=True).round(2)
    print(comparison.to_string())

    # Save to CSV
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'synthetic_fraud_data.csv')
    df.to_csv(output_path, index=False)
    print(f"\nDataset saved to: {output_path}")
    print(f"File size: {os.path.getsize(output_path) / 1024:.1f} KB")

    return df


if __name__ == '__main__':
    main()
