"""
Train all cybercrime classifiers on the dataset.
Run this script once to train and save models before starting the API.

Usage:
    cd backend
    python -m ml_training.train_classifier
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
from pathlib import Path

from app.ml.classifier import (
    DATASET_PATH, MODELS_DIR, train_all_models, save_models
)


def main():
    print("=" * 60)
    print("  Cybercrime Classifier Training")
    print("=" * 60)

    if not DATASET_PATH.exists():
        print(f"ERROR: Dataset not found at {DATASET_PATH}")
        sys.exit(1)

    # Load dataset
    df = pd.read_csv(DATASET_PATH)
    df = df.dropna(subset=["complaint_text", "crime_category"])
    print(f"\nDataset loaded: {len(df)} samples")
    print(f"Categories ({df['crime_category'].nunique()}):")
    for cat, count in df["crime_category"].value_counts().items():
        print(f"   {cat}: {count} samples")

    print(f"\nTraining models...")
    fitted_models, results, le = train_all_models(df)

    print("\nResults:")
    print(f"{'Model':<25} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'F1':>10}")
    print("-" * 65)
    for model_name, metrics in results.items():
        print(
            f"{model_name:<25} "
            f"{metrics['accuracy']:>9.1f}% "
            f"{metrics['precision']:>9.1f}% "
            f"{metrics['recall']:>9.1f}% "
            f"{metrics['f1_score']:>9.1f}%"
        )

    save_models(fitted_models, le, results)
    print(f"\nSUCCESS: Models saved to: {MODELS_DIR}")
    print("   You can now start the API server.")


if __name__ == "__main__":
    main()
