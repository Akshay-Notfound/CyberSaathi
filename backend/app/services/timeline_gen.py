"""
Timeline Generator — constructs a chronological incident timeline
from extracted entities across all chat messages and evidence files.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import re


# ─── Event Types ───────────────────────────────────────────────────────────────

EVENT_TYPE_ICONS = {
    "payment": "💸",
    "call": "📞",
    "message": "💬",
    "login": "🔐",
    "document": "📄",
    "threat": "⚠️",
    "discovery": "🔍",
    "report": "📋",
    "other": "📌",
}

# Keywords that suggest event types
EVENT_TYPE_KEYWORDS = {
    "payment": ["paid", "transferred", "debited", "transaction", "upi", "payment", "withdrew"],
    "call": ["called", "received call", "phone call", "spoke to", "caller"],
    "message": ["message", "sms", "whatsapp", "email", "received message", "sent"],
    "login": ["logged in", "otp", "password", "credential", "login", "access"],
    "document": ["received document", "offer letter", "receipt", "screenshot uploaded"],
    "threat": ["threatened", "blackmail", "demanded", "extortion"],
    "discovery": ["noticed", "realized", "discovered", "found out", "check", "alert"],
    "report": ["reported", "complaint", "called helpline", "informed bank"],
}


def detect_event_type(description: str) -> str:
    desc_lower = description.lower()
    for event_type, keywords in EVENT_TYPE_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return event_type
    return "other"


def parse_datetime_string(date_str: str, time_str: Optional[str] = None) -> Optional[str]:
    """Try to parse a date string into a standardized format."""
    formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
        "%d/%m/%y", "%d-%m-%y",
        "%B %d, %Y", "%d %B %Y", "%b %d, %Y", "%d %b %Y",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            if time_str:
                time_str_clean = time_str.strip().upper()
                for tfmt in ["%I:%M %p", "%I:%M:%S %p", "%H:%M", "%H:%M:%S"]:
                    try:
                        t = datetime.strptime(time_str_clean, tfmt)
                        dt = dt.replace(hour=t.hour, minute=t.minute)
                        break
                    except ValueError:
                        continue
            return dt.strftime("%d %b %Y, %I:%M %p" if time_str else "%d %b %Y")
        except ValueError:
            continue
    return date_str  # Return as-is if parsing fails


def build_timeline(
    chat_messages: List[Dict],
    evidence_files: List[Any],
    extracted_entities: Dict,
) -> List[Dict]:
    """
    Build a chronological timeline of the incident from all sources.

    Args:
        chat_messages: List of chat message dicts with content and entities
        evidence_files: Evidence file records
        extracted_entities: Combined entities from all sources

    Returns:
        Sorted list of timeline events: [{datetime, description, source, event_type, icon}]
    """
    events = []

    # Extract events from chat messages
    for msg in chat_messages:
        if msg.get("role") != "user":
            continue
        content = msg.get("content", "")
        msg_entities = msg.get("extracted_entities", {})

        dates = msg_entities.get("dates", [])
        times = msg_entities.get("times", [])
        amounts = msg_entities.get("amounts", [])

        if dates:
            # Create event for each date found in this message
            for i, date in enumerate(dates):
                time = times[i] if i < len(times) else (times[0] if times else None)
                dt_str = parse_datetime_string(date, time)

                # Summarize the event
                desc = _summarize_message_event(content, amounts)
                event_type = detect_event_type(content)

                events.append({
                    "datetime": dt_str,
                    "description": desc,
                    "source": "Your description",
                    "event_type": event_type,
                    "icon": EVENT_TYPE_ICONS.get(event_type, "📌"),
                    "raw_date": date,
                    "sortable": _to_sortable(date, time),
                })
        elif amounts:
            # Amount mentioned without date — likely a key event
            desc = _summarize_message_event(content, amounts)
            event_type = detect_event_type(content)
            events.append({
                "datetime": "Date not specified",
                "description": desc,
                "source": "Your description",
                "event_type": event_type,
                "icon": EVENT_TYPE_ICONS.get(event_type, "📌"),
                "raw_date": "",
                "sortable": 999999999,
            })

    # Extract events from evidence files
    for ef in evidence_files:
        ocr_text = getattr(ef, "ocr_text", "") or ""
        ef_entities = getattr(ef, "extracted_entities", {}) or {}
        filename = getattr(ef, "original_filename", "Evidence file")
        doc_type = getattr(ef, "document_type", "document") or "document"

        dates = ef_entities.get("dates", [])
        times = ef_entities.get("times", [])
        amounts = ef_entities.get("amounts", [])

        if dates:
            for i, date in enumerate(dates[:1]):  # Take first date per file
                time = times[i] if i < len(times) else (times[0] if times else None)
                dt_str = parse_datetime_string(date, time)

                amount_str = f" | Amount: {amounts[0]}" if amounts else ""
                desc = f"{doc_type.replace('_', ' ').title()} from {filename}{amount_str}"

                events.append({
                    "datetime": dt_str,
                    "description": desc,
                    "source": f"Uploaded: {filename}",
                    "event_type": "document",
                    "icon": EVENT_TYPE_ICONS.get("document", "📄"),
                    "raw_date": date,
                    "sortable": _to_sortable(date, time),
                })

    # Sort by sortable key (puts undated events at the end)
    events.sort(key=lambda x: x.get("sortable", 999999999))

    # Remove internal sortable key from output
    for e in events:
        e.pop("sortable", None)
        e.pop("raw_date", None)

    return events


def _summarize_message_event(content: str, amounts: List[str]) -> str:
    """Create a short description of a chat message event."""
    content_lower = content.lower()

    if "otp" in content_lower and ("share" in content_lower or "gave" in content_lower):
        return "OTP shared with caller"
    elif "transfer" in content_lower or "paid" in content_lower or "debited" in content_lower:
        amount_str = f" ₹{amounts[0]}" if amounts else ""
        return f"Financial transaction{amount_str} occurred"
    elif "call" in content_lower or "called" in content_lower:
        return "Fraudulent call received"
    elif "link" in content_lower or "click" in content_lower:
        return "Phishing link clicked / credentials entered"
    elif "message" in content_lower or "sms" in content_lower:
        return "Fraudulent message received"
    elif amounts:
        return f"Amount {amounts[0]} involved in incident"
    else:
        # Take first 80 chars of content
        return content[:80].strip() + ("..." if len(content) > 80 else "")


def _to_sortable(date_str: str, time_str: Optional[str] = None) -> int:
    """Convert date+time to sortable integer (YYYYMMDDHHM)."""
    formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
        "%d/%m/%y", "%d-%m-%y",
        "%B %d, %Y", "%d %B %Y", "%b %d, %Y", "%d %b %Y",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            if time_str:
                for tfmt in ["%I:%M %p", "%H:%M", "%I:%M:%S %p"]:
                    try:
                        t = datetime.strptime(time_str.strip().upper(), tfmt)
                        dt = dt.replace(hour=t.hour, minute=t.minute)
                        break
                    except ValueError:
                        continue
            return int(dt.strftime("%Y%m%d%H%M"))
        except ValueError:
            continue
    return 999999999
