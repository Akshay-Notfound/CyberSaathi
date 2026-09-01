"""
Named Entity Recognition (NER) module.
Extracts cybercrime-relevant entities from free text using regex + spaCy patterns.
Handles: phone numbers, UPI IDs, amounts, transaction IDs, bank names,
         dates, times, URLs, email addresses, account numbers.
"""

import re
from typing import Dict, List, Any
from datetime import datetime


# ─── Regex Patterns ────────────────────────────────────────────────────────────

PATTERNS = {
    "phone_numbers": re.compile(
        r"(?<!\d)(?:\+91[\-\s]?)?[6-9]\d{9}(?!\d)"
    ),
    "upi_ids": re.compile(
        r"[a-zA-Z0-9.\-_+]+@(?:okaxis|oksbi|okicici|okhdfcbank|ybl|ibl|axl|upi|paytm|"
        r"apl|freecharge|indus|kotak|rbl|sbi|icici|hdfc|axis|airtel|jio|"
        r"okbizaxis|ikwik|timecosmos|hdfcbank|[a-zA-Z0-9]+)"
    ),
    "amounts": re.compile(
        r"(?:₹|Rs\.?|INR|rupees?)\s*[\d,]+(?:\.\d{1,2})?|"
        r"[\d,]+(?:\.\d{1,2})?\s*(?:₹|Rs\.?|INR|rupees?)"
    ),
    "transaction_ids": re.compile(
        r"(?:txn(?:\s*id)?|transaction\s*(?:id|no\.?|number|ref(?:erence)?)|"
        r"utr|rrn|ref(?:erence)?\s*(?:id|no\.?|number)|order\s*(?:id|no\.?))"
        r"[\s:]*([A-Z0-9]{6,25})",
        re.IGNORECASE,
    ),
    "urls": re.compile(
        r"https?://[^\s\"'<>)]+|www\.[^\s\"'<>)]+"
    ),
    "emails": re.compile(
        r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
    ),
    "account_numbers": re.compile(
        r"(?:account\s*(?:no\.?|number|num))[\s:]*(\d{9,18})",
        re.IGNORECASE,
    ),
    "ifsc_codes": re.compile(
        r"\b[A-Z]{4}0[A-Z0-9]{6}\b"
    ),
    "dates": re.compile(
        r"\b(?:\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|"
        r"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|"
        r"jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"
        r"\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}|"
        r"\d{1,2}\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|"
        r"jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"
        r"\s+\d{4})\b",
        re.IGNORECASE,
    ),
    "times": re.compile(
        r"\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b"
    ),
    "pan_numbers": re.compile(
        r"\b[A-Z]{5}\d{4}[A-Z]\b"
    ),
    "aadhaar_numbers": re.compile(
        r"\b\d{4}\s?\d{4}\s?\d{4}\b"
    ),
}

BANK_NAMES = [
    "SBI", "State Bank", "HDFC", "ICICI", "Axis Bank", "Kotak", "Punjab National",
    "PNB", "Bank of Baroda", "BOB", "Canara Bank", "Union Bank", "IndusInd",
    "Yes Bank", "IDFC", "Federal Bank", "UCO Bank", "Indian Bank", "IOB",
    "Paytm", "PhonePe", "Google Pay", "GPay", "Amazon Pay", "BHIM",
    "MobiKwik", "Freecharge", "Airtel Money", "Jio Pay",
]

PAYMENT_APPS = [
    "PhonePe", "Google Pay", "GPay", "Paytm", "BHIM", "Amazon Pay",
    "WhatsApp Pay", "Cred", "Slice", "MobiKwik",
]

BANK_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(b) for b in BANK_NAMES) + r")\b",
    re.IGNORECASE,
)

PAYMENT_APP_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(p) for p in PAYMENT_APPS) + r")\b",
    re.IGNORECASE,
)


def _deduplicate(items: List[str]) -> List[str]:
    seen = set()
    result = []
    for item in items:
        cleaned = item.strip()
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            result.append(cleaned)
    return result


def _clean_amount(raw: str) -> str:
    """Normalize amount strings to a consistent format."""
    num = re.sub(r"[₹RsINrupee\s,]", "", raw, flags=re.IGNORECASE).strip(".")
    try:
        val = float(num)
        return f"₹{val:,.2f}"
    except ValueError:
        return raw.strip()


def extract_entities(text: str) -> Dict[str, Any]:
    """
    Extract all cybercrime-relevant entities from text.

    Returns:
        dict with keys: phones, upi_ids, amounts, transaction_ids, urls,
                        emails, account_numbers, ifsc_codes, dates, times,
                        banks, payment_apps, pan_numbers
    """
    entities: Dict[str, Any] = {}

    # Phone numbers
    entities["phone_numbers"] = _deduplicate(PATTERNS["phone_numbers"].findall(text))

    # UPI IDs
    entities["upi_ids"] = _deduplicate(PATTERNS["upi_ids"].findall(text))

    # Financial amounts
    raw_amounts = PATTERNS["amounts"].findall(text)
    entities["amounts"] = _deduplicate([_clean_amount(a) for a in raw_amounts])

    # Transaction IDs
    entities["transaction_ids"] = _deduplicate(PATTERNS["transaction_ids"].findall(text))

    # URLs
    entities["urls"] = _deduplicate(PATTERNS["urls"].findall(text))

    # Emails — filter out UPI IDs already found
    all_emails = _deduplicate(PATTERNS["emails"].findall(text))
    entities["emails"] = [e for e in all_emails if "@" not in e or not any(
        e == u for u in entities["upi_ids"]
    )]

    # Account numbers
    entities["account_numbers"] = _deduplicate(PATTERNS["account_numbers"].findall(text))

    # IFSC codes
    entities["ifsc_codes"] = _deduplicate(PATTERNS["ifsc_codes"].findall(text))

    # Dates and times
    entities["dates"] = _deduplicate(PATTERNS["dates"].findall(text))
    entities["times"] = _deduplicate(PATTERNS["times"].findall(text))

    # Bank names
    entities["banks"] = _deduplicate(BANK_PATTERN.findall(text))

    # Payment apps
    entities["payment_apps"] = _deduplicate(PAYMENT_APP_PATTERN.findall(text))

    # PAN numbers (mask for privacy)
    pans = PATTERNS["pan_numbers"].findall(text)
    entities["pan_numbers"] = [p[:2] + "***" + p[-1] for p in _deduplicate(pans)]

    # Remove empty lists for cleaner output
    return {k: v for k, v in entities.items() if v}


def merge_entities(existing: Dict, new: Dict) -> Dict:
    """Merge two entity dicts, deduplicating lists."""
    merged = dict(existing)
    for key, value in new.items():
        if key in merged and isinstance(merged[key], list):
            merged[key] = _deduplicate(merged[key] + value)
        else:
            merged[key] = value
    return merged


def entities_to_summary(entities: Dict) -> str:
    """Convert extracted entities to a human-readable summary string."""
    parts = []
    label_map = {
        "phone_numbers": "📞 Phone Numbers",
        "upi_ids": "💳 UPI IDs",
        "amounts": "💰 Amounts",
        "transaction_ids": "🔖 Transaction IDs",
        "urls": "🔗 URLs",
        "emails": "📧 Emails",
        "account_numbers": "🏦 Account Numbers",
        "ifsc_codes": "🔢 IFSC Codes",
        "dates": "📅 Dates",
        "times": "⏰ Times",
        "banks": "🏛️ Banks",
        "payment_apps": "📱 Payment Apps",
    }
    for key, label in label_map.items():
        if key in entities and entities[key]:
            parts.append(f"{label}: {', '.join(str(v) for v in entities[key])}")
    return "\n".join(parts) if parts else "No specific entities detected."


if __name__ == "__main__":
    sample = """
    Yesterday I received a call from 9876543210. They said they were from SBI.
    I transferred ₹25,000 to xyz@oksbi at 4:32 PM. 
    Transaction ID: UTR123456789. My account number is 1234567890.
    They sent me a link: https://fake-bank.com/login
    """
    result = extract_entities(sample)
    for k, v in result.items():
        print(f"{k}: {v}")
