from fastapi import APIRouter, BackgroundTasks
from app.ml.model_benchmark import run_benchmark
from app.ml.classifier import get_benchmark_results

router = APIRouter(prefix="/api/ml", tags=["ML Benchmark"])


@router.get("/benchmark")
async def get_benchmark():
    """
    Return model benchmark comparison results.
    Returns cached results if available, otherwise runs training first.
    """
    results = get_benchmark_results()
    if results:
        from app.ml.model_benchmark import _format_results
        return {"status": "cached", **_format_results(results)}

    # Run benchmark synchronously for first time
    result = run_benchmark(force_retrain=False)
    if "error" in result:
        return {"status": "error", **result}
    return {"status": "fresh", **result}


@router.post("/train")
async def train_models(background_tasks: BackgroundTasks):
    """
    Trigger model training in the background.
    """
    background_tasks.add_task(run_benchmark, force_retrain=True)
    return {
        "message": "Model training started in the background. Check /benchmark in a few minutes.",
        "status": "training",
    }


@router.get("/categories")
async def get_categories():
    """Return the list of cybercrime categories the model can classify."""
    from app.ml.classifier import CRIME_CATEGORIES, CATEGORY_INDICATORS
    return {
        "categories": [
            {
                "name": cat,
                "indicators": CATEGORY_INDICATORS.get(cat, []),
            }
            for cat in CRIME_CATEGORIES
        ]
    }
