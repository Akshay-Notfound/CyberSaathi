"""
PDF Export Service — generates a professional, printable complaint PDF.
Uses ReportLab for PDF generation.
"""

import io
from datetime import datetime
from typing import Dict, List, Any, Optional

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm, mm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, KeepTogether, Image as RLImage
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    RLImage = None


# Color scheme
NAVY = colors.HexColor("#0f172a")
BLUE = colors.HexColor("#3b82f6")
RED = colors.HexColor("#ef4444")
ORANGE = colors.HexColor("#f97316")
GREEN = colors.HexColor("#22c55e")
LIGHT_GRAY = colors.HexColor("#f1f5f9")
MID_GRAY = colors.HexColor("#64748b")
WHITE = colors.white


RISK_COLORS = {
    "CRITICAL": colors.HexColor("#ef4444"),
    "HIGH": colors.HexColor("#f97316"),
    "MEDIUM": colors.HexColor("#eab308"),
    "LOW": colors.HexColor("#22c55e"),
}


def generate_complaint_pdf(
    user: Any,
    complaint_data: Dict,
    entities: Dict,
    timeline: List[Dict],
    evidence_files: List[Any],
    complaint_text: str,
) -> bytes:
    """
    Generate a professional PDF complaint document.

    Returns:
        PDF file as bytes
    """
    if not REPORTLAB_AVAILABLE:
        # Return a plain text PDF fallback
        return complaint_text.encode("utf-8")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    # ─── Custom Styles ─────────────────────────────────────────────────────────
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=18,
        textColor=NAVY,
        spaceAfter=6,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=MID_GRAY,
        spaceAfter=4,
        alignment=TA_CENTER,
    )
    section_header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontSize=11,
        textColor=WHITE,
        spaceBefore=12,
        spaceAfter=6,
        fontName="Helvetica-Bold",
        backColor=NAVY,
        leftPadding=8,
        rightPadding=8,
        topPadding=4,
        bottomPadding=4,
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        textColor=NAVY,
        spaceAfter=4,
        leading=14,
        alignment=TA_JUSTIFY,
    )
    label_style = ParagraphStyle(
        "Label",
        parent=styles["Normal"],
        fontSize=9,
        textColor=MID_GRAY,
        fontName="Helvetica-Bold",
    )
    value_style = ParagraphStyle(
        "Value",
        parent=styles["Normal"],
        fontSize=10,
        textColor=NAVY,
    )

    # ─── Header ────────────────────────────────────────────────────────────────
    story.append(Paragraph("🛡️ CYBERCRIME COMPLAINT", title_style))
    story.append(Paragraph("AI-Powered Cyber Crime Complaint & Assistance System", subtitle_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%d %B %Y at %I:%M %p')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=BLUE, spaceAfter=12))

    # ─── Risk Level Banner ─────────────────────────────────────────────────────
    risk_level = complaint_data.get("risk_level", "MEDIUM")
    risk_color = RISK_COLORS.get(risk_level, ORANGE)
    risk_table = Table(
        [[Paragraph(f"⚠ RISK LEVEL: {risk_level}", ParagraphStyle(
            "Risk", fontSize=12, textColor=WHITE, fontName="Helvetica-Bold", alignment=TA_CENTER
        ))]],
        colWidths=["100%"],
    )
    risk_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), risk_color),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [risk_color]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("ROUNDEDCORNERS", (0, 0), (-1, -1), [4, 4, 4, 4]),
    ]))
    story.append(risk_table)
    story.append(Spacer(1, 10))

    # ─── Section: Complainant Details ─────────────────────────────────────────
    story.append(Paragraph("SECTION 1 — COMPLAINANT DETAILS", section_header_style))
    complainant_data = [
        ["Name:", getattr(user, "full_name", "N/A")],
        ["Email:", getattr(user, "email", "N/A")],
        ["Phone:", getattr(user, "phone", "Not provided") or "Not provided"],
        ["Date of Complaint:", datetime.now().strftime("%d %B %Y")],
    ]
    _add_info_table(story, complainant_data, label_style, value_style)

    # ─── Section: Classification ───────────────────────────────────────────────
    story.append(Paragraph("SECTION 2 — INCIDENT CLASSIFICATION", section_header_style))
    confidence = int((complaint_data.get("crime_category_confidence", 0)) * 100)
    classification_data = [
        ["Crime Category:", complaint_data.get("crime_category", "Unknown")],
        ["AI Confidence:", f"{confidence}%"],
        ["Risk Level:", risk_level],
        ["Incident Date:", complaint_data.get("incident_date", "Not specified") or entities.get("dates", ["Not specified"])[0] if entities.get("dates") else "Not specified"],
    ]
    _add_info_table(story, classification_data, label_style, value_style)

    # Indicators
    indicators = complaint_data.get("crime_indicators", [])
    if indicators:
        story.append(Paragraph("Key Fraud Indicators Detected:", label_style))
        for ind in indicators:
            story.append(Paragraph(f"  ✓ {ind}", body_style))
        story.append(Spacer(1, 6))

    # ─── Section: Incident Description ────────────────────────────────────────
    story.append(Paragraph("SECTION 3 — INCIDENT DESCRIPTION", section_header_style))
    desc = complaint_data.get("incident_description") or "Not provided"
    story.append(Paragraph(desc, body_style))
    story.append(Spacer(1, 6))

    # ─── Section: Financial Details ───────────────────────────────────────────
    story.append(Paragraph("SECTION 4 — FINANCIAL DETAILS", section_header_style))
    loss = complaint_data.get("financial_loss") or 0
    financial_data = [
        ["Total Loss:", f"₹{loss:,.0f}" if loss else "Not disclosed"],
        ["Payment Method:", complaint_data.get("payment_method", "Not specified") or "Not specified"],
        ["Transaction IDs:", ", ".join(entities.get("transaction_ids", [])) or "Not provided"],
        ["UPI IDs Involved:", ", ".join(entities.get("upi_ids", [])) or "Not provided"],
        ["Bank / Platform:", ", ".join(entities.get("banks", [])) or "Not specified"],
    ]
    _add_info_table(story, financial_data, label_style, value_style)

    # ─── Section: Suspect Information ─────────────────────────────────────────
    story.append(Paragraph("SECTION 5 — SUSPECT INFORMATION", section_header_style))
    suspect_data = [
        ["Phone Numbers:", ", ".join(entities.get("phone_numbers", [])) or "Not provided"],
        ["UPI IDs:", ", ".join(entities.get("upi_ids", [])) or "Not provided"],
        ["Emails:", ", ".join(entities.get("emails", [])) or "Not provided"],
        ["URLs / Websites:", ", ".join(entities.get("urls", [])) or "Not provided"],
    ]
    _add_info_table(story, suspect_data, label_style, value_style)

    # ─── Section: Evidence ────────────────────────────────────────────────────
    story.append(Paragraph("SECTION 6 — DIGITAL EVIDENCE", section_header_style))
    if evidence_files:
        for idx, ef in enumerate(evidence_files, 1):
            doc_type = (getattr(ef, "document_type", "document") or "document").replace("_", " ").title()
            orig_name = getattr(ef, "original_filename", f"Evidence_{idx}")
            file_size_kb = round((getattr(ef, "file_size", 0) or 0) / 1024, 1)
            file_type = getattr(ef, "file_type", "unknown")
            stored_path = getattr(ef, "stored_filename", "")

            # Exhibit Title Header
            exhibit_title = f"<b>Exhibit {idx}:</b> {orig_name} &nbsp;·&nbsp; <i>{doc_type}</i>"
            if file_size_kb > 0:
                exhibit_title += f" &nbsp;({file_size_kb} KB)"
            
            exhibit_header = Paragraph(exhibit_title, ParagraphStyle(
                "ExhibitHeader",
                parent=styles["Normal"],
                fontSize=9.5,
                textColor=NAVY,
                fontName="Helvetica-Bold",
                spaceBefore=6,
                spaceAfter=4,
            ))

            evidence_elements = [exhibit_header]

            # Try to load and embed the actual image/screenshot or PDF page
            embedded_image = None
            if stored_path:
                from pathlib import Path
                p = Path(stored_path)
                if not p.is_absolute():
                    p = Path.cwd() / p
                
                if p.exists():
                    # 1. Image / Screenshot
                    if file_type == "image" or p.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]:
                        try:
                            import PIL.Image
                            pil_img = PIL.Image.open(p)
                            img_buf = io.BytesIO()
                            if pil_img.mode in ("RGBA", "LA") or (pil_img.mode == "P" and "transparency" in pil_img.info):
                                pil_img.save(img_buf, format="PNG")
                            else:
                                pil_img.convert("RGB").save(img_buf, format="JPEG", quality=92)
                            img_buf.seek(0)
                            
                            w, h = pil_img.size
                            max_w = 14.5 * cm
                            max_h = 10.5 * cm
                            scale = min(max_w / w, max_h / h)
                            target_w = max(w * scale, 3 * cm)
                            target_h = max(h * scale, 2 * cm)
                            
                            embedded_image = RLImage(img_buf, width=target_w, height=target_h)
                        except Exception:
                            pass

                    # 2. PDF Document (Render First Page)
                    elif file_type == "pdf" or p.suffix.lower() == ".pdf":
                        try:
                            import pymupdf
                            pdf_doc = pymupdf.open(str(p))
                            if len(pdf_doc) > 0:
                                page = pdf_doc[0]
                                pix = page.get_pixmap(dpi=150)
                                img_bytes = pix.tobytes("png")
                                img_buf = io.BytesIO(img_bytes)
                                
                                w, h = pix.width, pix.height
                                max_w = 14.5 * cm
                                max_h = 10.5 * cm
                                scale = min(max_w / w, max_h / h)
                                target_w = max(w * scale, 3 * cm)
                                target_h = max(h * scale, 2 * cm)
                                
                                embedded_image = RLImage(img_buf, width=target_w, height=target_h)
                        except Exception:
                            pass

            if embedded_image:
                # Wrap embedded image inside a stylized container box with subtle border
                img_table = Table([[embedded_image]], colWidths=[15 * cm])
                img_table.setStyle(TableStyle([
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
                    ("BOX", (0, 0), (-1, -1), 0.5, MID_GRAY),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 6),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ]))
                evidence_elements.append(img_table)
            else:
                evidence_elements.append(Paragraph(f"  ✓ {orig_name} — {doc_type} (Attached file verified)", body_style))

            # Add OCR summary / detected info if available
            ocr_text = getattr(ef, "ocr_text", None)
            entities_in_file = getattr(ef, "extracted_entities", {}) or {}
            if ocr_text or (entities_in_file and any(entities_in_file.values())):
                ocr_preview_str = (ocr_text or "")[:150].strip().replace("\n", " ")
                if len(ocr_text or "") > 150:
                    ocr_preview_str += "..."
                if ocr_preview_str:
                    evidence_elements.append(Paragraph(
                        f"<b>OCR Text Summary:</b> <i>{ocr_preview_str}</i>",
                        ParagraphStyle("OCRSnippet", parent=styles["Normal"], fontSize=8, textColor=MID_GRAY, spaceBefore=3, spaceAfter=4)
                    ))

            evidence_elements.append(Spacer(1, 6))
            story.append(KeepTogether(evidence_elements))
    else:
        story.append(Paragraph("No files uploaded", body_style))
    story.append(Spacer(1, 6))

    # ─── Section: Timeline ────────────────────────────────────────────────────
    if timeline:
        story.append(Paragraph("SECTION 7 — INCIDENT TIMELINE", section_header_style))
        timeline_table_data = [["#", "Date / Time", "Event", "Source"]]
        for i, event in enumerate(timeline, 1):
            timeline_table_data.append([
                str(i),
                event.get("datetime", ""),
                event.get("description", "")[:60],
                event.get("source", "")[:30],
            ])
        t = Table(timeline_table_data, colWidths=[1 * cm, 4 * cm, 9 * cm, 4 * cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
            ("GRID", (0, 0), (-1, -1), 0.5, MID_GRAY),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(t)
        story.append(Spacer(1, 8))

    # ─── Section: Requested Action ────────────────────────────────────────────
    story.append(Paragraph("SECTION 8 — REQUESTED ACTION", section_header_style))
    actions = [
        "Investigate the incident and identify the perpetrators",
        "Freeze fraudulent accounts / UPI IDs mentioned above",
        "Assist in recovering the financial loss wherever possible",
        "Take appropriate legal action against the perpetrators",
        "Issue necessary directions to banks and payment platforms",
    ]
    for i, action in enumerate(actions, 1):
        story.append(Paragraph(f"{i}. {action}", body_style))
    story.append(Spacer(1, 8))

    # ─── Section: Declaration ─────────────────────────────────────────────────
    story.append(Paragraph("SECTION 9 — DECLARATION", section_header_style))
    declaration = (
        "I hereby declare that the information provided in this complaint is true and correct "
        "to the best of my knowledge. I understand that filing a false complaint is a punishable "
        "offence under applicable law. I am willing to provide additional information and cooperate "
        "fully with the investigation."
    )
    story.append(Paragraph(declaration, body_style))
    story.append(Spacer(1, 20))

    # Signature area
    sig_data = [
        ["Complainant Signature:", "________________________"],
        ["Name:", getattr(user, "full_name", "")],
        ["Date:", datetime.now().strftime("%d %B %Y")],
    ]
    _add_info_table(story, sig_data, label_style, value_style)

    # ─── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=MID_GRAY))
    footer_style = ParagraphStyle("Footer", fontSize=8, textColor=MID_GRAY, alignment=TA_CENTER, spaceAfter=2)
    story.append(Paragraph("This complaint was prepared with AI assistance. Please review before submission.", footer_style))
    story.append(Paragraph("National Cybercrime Helpline: 1930 | Portal: cybercrime.gov.in", footer_style))
    story.append(Paragraph("⚠ This document is confidential and contains sensitive personal information.", footer_style))

    doc.build(story)
    return buffer.getvalue()


def _add_info_table(story: list, data: list, label_style: Any, value_style: Any):
    """Add a two-column info table to the story."""
    table_data = []
    for label, value in data:
        table_data.append([
            Paragraph(label, label_style),
            Paragraph(str(value), value_style),
        ])
    t = Table(table_data, colWidths=[4 * cm, 13 * cm])
    t.setStyle(TableStyle([
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT_GRAY]),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))
