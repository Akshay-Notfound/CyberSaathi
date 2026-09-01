"""
OCR & Document Processing Pipeline.
Handles images (PNG, JPG, WEBP) and PDFs.
Extracts text via Tesseract OCR, then runs NER on the extracted text.
"""

import io
import os
import re
from pathlib import Path
from typing import Dict, Optional, Tuple

try:
    import pytesseract
    from PIL import Image, ImageEnhance, ImageFilter
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

from app.ml.ner_extractor import extract_entities


# ─── Document Type Detection ───────────────────────────────────────────────────

DOC_TYPE_PATTERNS = {
    "bank_transaction": [
        r"transaction\s*(id|no|ref)", r"upi\s*ref", r"debit", r"credit",
        r"amount\s*:?\s*₹", r"transfer\s*successful", r"payment\s*success",
        r"account\s*debited", r"utr\s*no",
    ],
    "bank_statement": [
        r"statement\s*of\s*account", r"opening\s*balance", r"closing\s*balance",
        r"date.*narration.*amount", r"account\s*statement",
    ],
    "offer_letter": [
        r"offer\s*letter", r"job\s*offer", r"position\s*:", r"salary\s*:",
        r"joining\s*date", r"dear\s*candidate", r"we\s*are\s*pleased\s*to\s*offer",
    ],
    "payment_receipt": [
        r"payment\s*receipt", r"invoice", r"receipt\s*no", r"paid\s*to",
        r"order\s*id", r"booking\s*id",
    ],
    "chat_screenshot": [
        r"(delivered|read|seen)", r"today|yesterday",
        r"(am|pm)\s*$", r"online",
    ],
    "email": [
        r"from\s*:", r"to\s*:", r"subject\s*:", r"dear\s+\w+",
    ],
    "sms": [
        r"rs\.\s*\d", r"txn\s*id", r"ur\s*acct", r"a/c\s*(no|xx)",
        r"imps|neft|rtgs", r"\bsbi\b|\bhdfc\b|\bicici\b",
    ],
}


def detect_document_type(text: str) -> str:
    """Detect the type of document from its OCR text."""
    text_lower = text.lower()
    scores = {}
    for doc_type, patterns in DOC_TYPE_PATTERNS.items():
        score = sum(1 for p in patterns if re.search(p, text_lower))
        scores[doc_type] = score

    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "unknown"


# ─── Image Preprocessing ───────────────────────────────────────────────────────

def preprocess_image_for_ocr(img: "Image.Image") -> "Image.Image":
    """Enhance image quality for better OCR accuracy."""
    # Convert to RGB if needed
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    # Upscale small images
    w, h = img.size
    if w < 1000:
        scale = 1000 / w
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    # Convert to grayscale for better OCR
    img = img.convert("L")

    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)

    # Slight sharpening
    img = img.filter(ImageFilter.SHARPEN)

    return img


# ─── OCR Pipeline ─────────────────────────────────────────────────────────────

def extract_from_image(file_bytes: bytes, lang: str = "eng+hin") -> Dict:
    """
    Extract text and entities from an image file using Tesseract OCR.

    Args:
        file_bytes: Raw image file bytes
        lang: Tesseract language string (eng+hin for Hindi+English)

    Returns:
        dict with ocr_text, entities, document_type, confidence, method
    """
    if not TESSERACT_AVAILABLE:
        return {
            "ocr_text": "",
            "entities": {},
            "document_type": "unknown",
            "confidence": 0.0,
            "method": "unavailable",
            "error": "Tesseract not installed. Install pytesseract and tesseract-ocr.",
        }

    try:
        img = Image.open(io.BytesIO(file_bytes))
        img = preprocess_image_for_ocr(img)

        # Run OCR with confidence data
        config = "--oem 3 --psm 6 -c preserve_interword_spaces=1"
        ocr_data = pytesseract.image_to_data(img, lang=lang, config=config, output_type=pytesseract.Output.DICT)

        # Filter confident words
        words = [
            ocr_data["text"][i]
            for i in range(len(ocr_data["text"]))
            if int(ocr_data["conf"][i]) > 30 and ocr_data["text"][i].strip()
        ]
        text = " ".join(words)

        # Calculate average confidence
        confidences = [int(c) for c in ocr_data["conf"] if int(c) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

        entities = extract_entities(text)
        doc_type = detect_document_type(text)

        return {
            "ocr_text": text,
            "entities": entities,
            "document_type": doc_type,
            "confidence": round(avg_confidence, 1),
            "method": "tesseract",
        }

    except Exception as e:
        return {
            "ocr_text": "",
            "entities": {},
            "document_type": "unknown",
            "confidence": 0.0,
            "method": "tesseract",
            "error": str(e),
        }


def extract_from_pdf(file_bytes: bytes) -> Dict:
    """
    Extract text and entities from a PDF file using PyMuPDF.

    Returns:
        dict with ocr_text, entities, document_type, page_count, method
    """
    if not PYMUPDF_AVAILABLE:
        return {
            "ocr_text": "",
            "entities": {},
            "document_type": "unknown",
            "page_count": 0,
            "method": "unavailable",
            "error": "PyMuPDF not installed.",
        }

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        all_text = []

        for page_num in range(min(doc.page_count, 10)):  # Max 10 pages
            page = doc[page_num]
            text = page.get_text("text")
            all_text.append(text)

        combined_text = "\n\n".join(all_text)
        entities = extract_entities(combined_text)
        doc_type = detect_document_type(combined_text)

        return {
            "ocr_text": combined_text,
            "entities": entities,
            "document_type": doc_type,
            "page_count": doc.page_count,
            "method": "pymupdf",
        }

    except Exception as e:
        return {
            "ocr_text": "",
            "entities": {},
            "document_type": "unknown",
            "page_count": 0,
            "method": "pymupdf",
            "error": str(e),
        }


def process_file(file_bytes: bytes, filename: str, mime_type: str) -> Dict:
    """
    Route file to the appropriate processing pipeline.

    Args:
        file_bytes: Raw file content
        filename: Original filename (used for extension detection)
        mime_type: MIME type string

    Returns:
        Unified extraction result dict
    """
    ext = Path(filename).suffix.lower()
    is_pdf = mime_type == "application/pdf" or ext == ".pdf"
    is_image = mime_type.startswith("image/") or ext in (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff")

    if is_pdf:
        result = extract_from_pdf(file_bytes)
        result["file_type"] = "pdf"
    elif is_image:
        result = extract_from_image(file_bytes)
        result["file_type"] = "image"
    else:
        # Try to decode as text
        try:
            text = file_bytes.decode("utf-8", errors="ignore")
            entities = extract_entities(text)
            result = {
                "ocr_text": text,
                "entities": entities,
                "document_type": detect_document_type(text),
                "file_type": "text",
                "method": "plain_text",
            }
        except Exception as e:
            result = {
                "ocr_text": "",
                "entities": {},
                "document_type": "unknown",
                "file_type": "unknown",
                "error": f"Unsupported file type: {ext}",
            }

    return result
