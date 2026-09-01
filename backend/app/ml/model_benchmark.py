"""
Model Benchmark — Trains all classifiers on the dataset and returns comparison metrics.
Used by the Model Comparison dashboard endpoint.
"""

import pandas as pd
from pathlib import Path
from typing import Dict, Optional

from app.ml.classifier import (
    DATASET_PATH, MODELS_DIR, train_all_models, save_models, get_benchmark_results
)


def run_benchmark(force_retrain: bool = False) -> Dict:
    """
    Load or train all models and return a benchmark comparison table.

    Args:
        force_retrain: If True, retrain even if results already exist.

    Returns:
        dict with 'models' list and 'summary' table data.
    """
    # Try loading cached results first
    if not force_retrain:
        cached = get_benchmark_results()
        if cached:
            return _format_results(cached)

    # Load dataset
    if not DATASET_PATH.exists():
        return {
            "error": "Training dataset not found. Please ensure cybercrime_dataset.csv exists.",
            "models": [],
        }

    try:
        df = pd.read_csv(DATASET_PATH)
        df = df.dropna(subset=["complaint_text", "crime_category"])
        print(f"Dataset loaded: {len(df)} samples, {df['crime_category'].nunique()} categories")

        # Train models
        fitted_models, results, le = train_all_models(df)
        save_models(fitted_models, le, results)
        return _format_results(results)

    except Exception as e:
        return {"error": str(e), "models": []}


def _format_results(results: Dict) -> Dict:
    """Format results for API response."""
    models_list = []
    for model_name, metrics in results.items():
        models_list.append({
            "model": model_name,
            "accuracy": metrics["accuracy"],
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "f1_score": metrics["f1_score"],
        })

    # Sort by F1 score descending
    models_list.sort(key=lambda x: x["f1_score"], reverse=True)

    # Per-class breakdown (use first model's structure)
    per_class = {}
    if results:
        first = list(results.values())[0]
        per_class = first.get("per_class", {})

    return {
        "models": models_list,
        "per_class_available": bool(per_class),
        "total_samples": "See dataset",
        "best_model": models_list[0]["model"] if models_list else None,
    }
