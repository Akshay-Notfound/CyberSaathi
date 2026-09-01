"""
Complaint Generator — assembles all extracted data into a structured complaint.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any


COMPLAINT_TEMPLATE = """
CYBERCRIME COMPLAINT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: COMPLAINANT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: {complainant_name}
Email: {complainant_email}
Phone: {complainant_phone}
Date of Complaint: {complaint_date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: INCIDENT CLASSIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crime Category: {crime_category}
Classification Confidence: {confidence}%
Risk Level: {risk_level}
Incident Date: {incident_date}
Incident Time: {incident_time}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: INCIDENT DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{incident_description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: FINANCIAL DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Financial Loss: ₹{financial_loss}
Payment Method: {payment_method}
Transaction IDs: {transaction_ids}
UPI IDs Involved: {upi_ids}
Bank/Platform: {bank_name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5: SUSPECT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phone Numbers: {suspect_phones}
UPI IDs: {suspect_upi}
Email Addresses: {suspect_emails}
URLs / Websites: {suspect_urls}
Other Identifiers: {other_identifiers}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6: DIGITAL EVIDENCE AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{evidence_list}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7: INCIDENT TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{timeline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8: KEY INDICATORS DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{indicators}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9: REQUESTED ACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I respectfully request the appropriate cybercrime authorities to:
1. Investigate the incident and identify the perpetrators
2. Freeze any fraudulent accounts / UPI IDs mentioned above
3. Assist in recovering the financial loss wherever possible
4. Take appropriate legal action against the perpetrators
5. Issue necessary orders to banks/payment platforms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 10: DECLARATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I hereby declare that the information provided in this complaint is true and 
correct to the best of my knowledge. I understand that filing a false complaint 
is a punishable offence. I am willing to provide additional information and 
cooperate fully with the investigation.

Complainant Signature: ______________________
Date: {complaint_date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTE: This complaint has been prepared with AI assistance.
Please review all information before submission.
For immediate help, call: 1930 (National Cybercrime Helpline)
Online portal: https://cybercrime.gov.in
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""


def generate_complaint(
    user: Any,
    complaint_data: Dict,
    entities: Dict,
    timeline: List[Dict],
    evidence_files: List[Any],
    incident_description: str,
) -> str:
    """
    Generate a complete structured complaint text.

    Args:
        user: User model instance
        complaint_data: Complaint model data
        entities: Extracted entities dict
        timeline: List of chronological events
        evidence_files: Uploaded evidence file records
        incident_description: AI-generated description

    Returns:
        Formatted complaint string
    """
    # Format lists
    def fmt_list(lst: list, separator: str = ", ") -> str:
        return separator.join(str(i) for i in lst) if lst else "Not provided"

    # Format evidence list
    evidence_lines = []
    if evidence_files:
        for ef in evidence_files:
            doc_type = getattr(ef, "document_type", "document") or "document"
            evidence_lines.append(f"  ✓ {ef.original_filename} ({doc_type})")
    evidence_text = "\n".join(evidence_lines) if evidence_lines else "  No files uploaded"

    # Format timeline
    timeline_lines = []
    for i, event in enumerate(timeline, 1):
        dt = event.get("datetime", "Unknown time")
        desc = event.get("description", "")
        source = event.get("source", "")
        timeline_lines.append(f"  {i}. [{dt}] {desc}" + (f" (Source: {source})" if source else ""))
    timeline_text = "\n".join(timeline_lines) if timeline_lines else "  Timeline not available"

    # Format indicators
    indicators = complaint_data.get("crime_indicators", [])
    indicators_text = "\n".join(f"  ✓ {ind}" for ind in indicators) if indicators else "  None detected"

    # Format financial loss
    loss = complaint_data.get("financial_loss") or 0
    loss_str = f"{loss:,.0f}" if loss else "Not disclosed / No financial loss"

    # Format dates
    incident_date_obj = complaint_data.get("incident_date")
    incident_date_str = incident_date_obj.strftime("%d %B %Y") if incident_date_obj else "Not specified"
    incident_dates = entities.get("dates", [])
    if incident_dates and incident_date_str == "Not specified":
        incident_date_str = incident_dates[0]

    incident_times = entities.get("times", [])
    incident_time_str = incident_times[0] if incident_times else "Not specified"

    complaint_text = COMPLAINT_TEMPLATE.format(
        complainant_name=getattr(user, "full_name", "Complainant"),
        complainant_email=getattr(user, "email", ""),
        complainant_phone=getattr(user, "phone", "Not provided"),
        complaint_date=datetime.now().strftime("%d %B %Y, %I:%M %p"),
        crime_category=complaint_data.get("crime_category", "Unknown"),
        confidence=int((complaint_data.get("crime_category_confidence", 0)) * 100),
        risk_level=complaint_data.get("risk_level", "Unknown"),
        incident_date=incident_date_str,
        incident_time=incident_time_str,
        incident_description=incident_description or "Not provided",
        financial_loss=loss_str,
        payment_method=complaint_data.get("payment_method", "Not specified"),
        transaction_ids=fmt_list(entities.get("transaction_ids", [])),
        upi_ids=fmt_list(entities.get("upi_ids", [])),
        bank_name=fmt_list(entities.get("banks", [])),
        suspect_phones=fmt_list(entities.get("phone_numbers", [])),
        suspect_upi=fmt_list(entities.get("upi_ids", [])),
        suspect_emails=fmt_list(entities.get("emails", [])),
        suspect_urls=fmt_list(entities.get("urls", [])),
        other_identifiers=fmt_list(entities.get("ifsc_codes", [])),
        evidence_list=evidence_text,
        timeline=timeline_text,
        indicators=indicators_text,
    )

    return complaint_text.strip()
