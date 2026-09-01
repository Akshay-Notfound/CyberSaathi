"""
Cybercrime Classifier — Multi-model training and inference.
Trains Naive Bayes, Logistic Regression, SVM, Random Forest on TF-IDF features.
Also integrates DistilBERT (Hugging Face) for comparison.
Saves trained models to disk for production use.
"""

import os
import re
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple, Optional

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import warnings
warnings.filterwarnings("ignore")


# ─── Paths ─────────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent.parent.parent  # backend/
MODELS_DIR = BASE_DIR / "models"
DATASET_PATH = BASE_DIR / "ml_training" / "dataset" / "cybercrime_dataset.csv"
MODELS_DIR.mkdir(exist_ok=True)


# ─── Crime Categories ──────────────────────────────────────────────────────────

CRIME_CATEGORIES = [
    "UPI / Payment Fraud",
    "Banking Fraud",
    "OTP / Social Engineering",
    "Phishing",
    "Job / Employment Fraud",
    "Investment Fraud",
    "E-commerce Fraud",
    "Social Media Fraud",
    "Account Compromise",
    "Identity Theft",
    "Impersonation",
    "Cyber Extortion",
    "Malware / Ransomware",
    "Cryptocurrency Fraud",
    "Other / Unknown",
]

# Keyword-based indicators for XAI explanation
CATEGORY_INDICATORS = {
    "UPI / Payment Fraud": ["upi", "qr code", "gpay", "phonepe", "payment request", "scan", "transfer", "wrong transfer"],
    "Banking Fraud": ["bank account", "debit card", "credit card", "atm", "sim swap", "net banking", "ifsc", "account hacked"],
    "OTP / Social Engineering": ["otp", "one time password", "verification code", "share otp", "bank executive", "kyc", "remote access"],
    "Phishing": ["link", "fake website", "clicked link", "login page", "entered credentials", "email", "sms link", "url"],
    "Job / Employment Fraud": ["job offer", "registration fee", "work from home", "data entry", "offer letter", "security deposit", "employment", "internship", "intern", "part time", "tasks", "task"],
    "Investment Fraud": ["investment", "returns", "trading", "profit", "withdraw", "scheme", "mutual fund", "stock market", "telegram group"],
    "E-commerce Fraud": ["ordered", "purchased", "delivery", "product", "seller", "online shopping", "not delivered", "flipkart", "amazon", "olx"],
    "Social Media Fraud": ["whatsapp", "friend asked", "facebook", "instagram", "telegram", "social media", "dating", "matrimonial"],
    "Account Compromise": ["account hacked", "password changed", "lost access", "locked out", "unauthorized login", "hacker"],
    "Identity Theft": ["aadhaar", "pan card", "identity misused", "loan in my name", "credit card opened", "kyc misused"],
    "Impersonation": ["fake profile", "my photos", "fake account", "my name", "impersonating", "duplicate profile"],
    "Cyber Extortion": ["threatening", "blackmail", "pay or", "video", "photos shared", "extortion", "demand money"],
    "Malware / Ransomware": ["virus", "malware", "ransomware", "files encrypted", "remote access", "apk", "download", "hacked device"],
    "Cryptocurrency Fraud": ["bitcoin", "crypto", "usdt", "cryptocurrency", "ethereum", "wallet", "blockchain", "coin"],
    "Other / Unknown": [],
}


# ─── Text Preprocessing ────────────────────────────────────────────────────────

def preprocess_text(text: str) -> str:
    """Lowercase, remove special chars, normalize whitespace."""
    text = text.lower()
    text = re.sub(r"₹[\d,]+(?:\.\d+)?", " AMOUNT ", text)
    text = re.sub(r"\+?91?\d{10}", " PHONENUMBER ", text)
    text = re.sub(r"[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}", " EMAILADDRESS ", text)
    text = re.sub(r"https?://\S+|www\.\S+", " URL ", text)
    text = re.sub(r"\d{6,}", " LONGDIGIT ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ─── Model Building ────────────────────────────────────────────────────────────

def build_pipelines() -> Dict[str, Pipeline]:
    """Build sklearn pipelines for each model."""
    tfidf = lambda: TfidfVectorizer(
        preprocessor=preprocess_text,
        ngram_range=(1, 2),
        max_features=15000,
        min_df=1,
        sublinear_tf=True,
    )
    return {
        "Naive Bayes": Pipeline([("tfidf", tfidf()), ("clf", MultinomialNB(alpha=0.5))]),
        "Logistic Regression": Pipeline([("tfidf", tfidf()), ("clf", LogisticRegression(max_iter=1000, C=1.0, random_state=42))]),
        "SVM (Linear)": Pipeline([("tfidf", tfidf()), ("clf", LinearSVC(max_iter=2000, C=1.0, random_state=42))]),
        "Random Forest": Pipeline([("tfidf", tfidf()), ("clf", RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1))]),
    }


# ─── Training ──────────────────────────────────────────────────────────────────

def train_all_models(df: pd.DataFrame) -> Tuple[Dict, Dict, LabelEncoder]:
    """Train all models and return fitted pipelines + evaluation results."""
    X = df["complaint_text"].astype(str).tolist()
    y = df["crime_category"].astype(str).tolist()

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    pipelines = build_pipelines()
    results = {}
    fitted_models = {}

    for name, pipeline in pipelines.items():
        print(f"Training {name}...")
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        report = classification_report(
            y_test, y_pred,
            target_names=le.classes_,
            output_dict=True,
            zero_division=0,
        )
        results[name] = {
            "accuracy": round(acc * 100, 2),
            "precision": round(report["macro avg"]["precision"] * 100, 2),
            "recall": round(report["macro avg"]["recall"] * 100, 2),
            "f1_score": round(report["macro avg"]["f1-score"] * 100, 2),
            "per_class": {
                cls: {
                    "precision": round(report[cls]["precision"] * 100, 2),
                    "recall": round(report[cls]["recall"] * 100, 2),
                    "f1": round(report[cls]["f1-score"] * 100, 2),
                }
                for cls in le.classes_ if cls in report
            },
        }
        fitted_models[name] = pipeline
        print(f"  -> Accuracy: {acc:.2%}")

    return fitted_models, results, le


def save_models(models: Dict, le: LabelEncoder, results: Dict):
    """Save all models, label encoder, and results to disk."""
    for name, model in models.items():
        safe_name = name.replace(" ", "_").replace("(", "").replace(")", "").lower()
        joblib.dump(model, MODELS_DIR / f"{safe_name}.pkl")
        print(f"Saved: {safe_name}.pkl")

    joblib.dump(le, MODELS_DIR / "label_encoder.pkl")
    joblib.dump(results, MODELS_DIR / "benchmark_results.pkl")
    print("Saved: label_encoder.pkl, benchmark_results.pkl")


# ─── Inference ─────────────────────────────────────────────────────────────────

class CrimeClassifier:
    """
    Production classifier that loads the best saved model and provides predictions.
    Falls back to keyword-based classification if models are not trained yet.
    """

    def __init__(self, preferred_model: str = "logistic_regression"):
        self.model: Optional[Pipeline] = None
        self.le: Optional[LabelEncoder] = None
        self.model_name = preferred_model
        self._load()

    def _load(self):
        """Load model from disk if available."""
        try:
            model_path = MODELS_DIR / f"{self.model_name}.pkl"
            le_path = MODELS_DIR / "label_encoder.pkl"
            if model_path.exists() and le_path.exists():
                self.model = joblib.load(model_path)
                self.le = joblib.load(le_path)
                print(f"✓ Loaded classifier: {self.model_name}")
            else:
                print(f"Model not found at {model_path}. Using keyword fallback.")
        except Exception as e:
            print(f"Failed to load model: {e}. Using keyword fallback.")

    def _keyword_fallback(self, text: str) -> Tuple[str, float, List[str]]:
        """Simple keyword-based fallback classifier."""
        text_lower = text.lower()
        scores = {}
        for category, keywords in CATEGORY_INDICATORS.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            scores[category] = score

        best_cat = max(scores, key=scores.get)
        best_score = scores[best_cat]

        if best_score == 0:
            best_cat = "Other / Unknown"
            confidence = 0.3
        else:
            total = sum(scores.values())
            confidence = min(best_score / max(total, 1) + 0.3, 0.95)

        indicators = [kw for kw in CATEGORY_INDICATORS.get(best_cat, []) if kw in text_lower]
        return best_cat, round(confidence, 2), indicators[:5]

    def predict(self, text: str) -> Dict:
        """
        Classify a cybercrime complaint text.

        Returns:
            dict with: category, confidence, indicators, method
        """
        indicators = self._get_indicators(text)

        if self.model is not None and self.le is not None:
            try:
                processed = preprocess_text(text)

                # Get probability scores if supported
                clf = self.model.named_steps["clf"]
                tfidf_vec = self.model.named_steps["tfidf"]
                X = tfidf_vec.transform([processed])

                if hasattr(clf, "predict_proba"):
                    proba = clf.predict_proba(X)[0]
                    top_idx = np.argmax(proba)
                    confidence = float(proba[top_idx])
                    category = self.le.inverse_transform([top_idx])[0]

                    # Top 3 categories
                    top3_idx = np.argsort(proba)[::-1][:3]
                    alternatives = [
                        {"category": self.le.inverse_transform([i])[0], "confidence": round(float(proba[i]), 3)}
                        for i in top3_idx
                    ]
                else:
                    pred = clf.predict(X)[0]
                    category = self.le.inverse_transform([pred])[0]
                    confidence = 0.80
                    alternatives = [{"category": category, "confidence": confidence}]

                return {
                    "category": category,
                    "confidence": round(confidence, 3),
                    "indicators": indicators,
                    "alternatives": alternatives,
                    "method": f"ML ({self.model_name})",
                }
            except Exception as e:
                print(f"Model prediction failed: {e}, using fallback")

        # Keyword fallback
        category, confidence, kw_indicators = self._keyword_fallback(text)
        return {
            "category": category,
            "confidence": confidence,
            "indicators": kw_indicators or indicators,
            "alternatives": [{"category": category, "confidence": confidence}],
            "method": "keyword_fallback",
        }

    def _get_indicators(self, text: str) -> List[str]:
        """Extract present indicators from text for XAI explanation."""
        text_lower = text.lower()
        found = []
        for category, keywords in CATEGORY_INDICATORS.items():
            for kw in keywords:
                if kw in text_lower and kw not in found:
                    found.append(kw)
        return found[:8]  # Return top 8


# ─── Global Singleton ──────────────────────────────────────────────────────────

_classifier_instance: Optional[CrimeClassifier] = None


def get_classifier() -> CrimeClassifier:
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = CrimeClassifier()
    return _classifier_instance


def get_benchmark_results() -> Optional[Dict]:
    """Load saved benchmark results from disk."""
    results_path = MODELS_DIR / "benchmark_results.pkl"
    if results_path.exists():
        return joblib.load(results_path)
    return None


if __name__ == "__main__":
    # Quick test
    clf = get_classifier()
    test = "Someone called from my bank asking OTP. I gave it and ₹45000 was debited."
    result = clf.predict(test)
    print(f"Category: {result['category']}")
    print(f"Confidence: {result['confidence']:.1%}")
    print(f"Indicators: {result['indicators']}")
