from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List, Dict
import io

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.complaint import Complaint, ComplaintStatus, ChatMessage
from app.models.evidence import EvidenceFile
from app.services.complaint_gen import generate_complaint
from app.services.timeline_gen import build_timeline
from app.services.pdf_export import generate_complaint_pdf
from app.services.gemini_service import get_gemini_service

router = APIRouter(prefix="/api/complaint", tags=["Complaint"])


class GenerateRequest(BaseModel):
    complaint_id: int
    payment_method: Optional[str] = None
    incident_date: Optional[str] = None


@router.post("/generate")
async def generate(
    data: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a structured complaint from all collected data."""
    # Load complaint
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == data.complaint_id,
            Complaint.user_id == current_user.id,
        )
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    # Load chat messages
    msg_result = await db.execute(
        select(ChatMessage).where(ChatMessage.complaint_id == data.complaint_id).order_by(ChatMessage.id)
    )
    messages = msg_result.scalars().all()

    # Load evidence files
    ef_result = await db.execute(
        select(EvidenceFile).where(EvidenceFile.complaint_id == data.complaint_id)
    )
    evidence_files = ef_result.scalars().all()

    # Update optional fields
    if data.payment_method:
        complaint.payment_method = data.payment_method

    # Build timeline
    msg_dicts = [
        {"role": msg.role, "content": msg.content, "extracted_entities": msg.extracted_entities or {}}
        for msg in messages
    ]
    timeline = build_timeline(msg_dicts, evidence_files, complaint.extracted_entities or {})
    complaint.timeline = timeline

    # Generate incident description via Gemini
    gemini = get_gemini_service()
    conversation_text = " ".join(m.content for m in messages if m.role == "user")
    incident_data = {
        "crime_category": complaint.crime_category,
        "financial_loss": complaint.financial_loss,
        "extracted_entities": complaint.extracted_entities,
        "risk_level": complaint.risk_level,
    }
    description = gemini.generate_complaint_description(incident_data, conversation_text)
    complaint.incident_description = description

    # Generate the full complaint text
    complaint_text = generate_complaint(
        user=current_user,
        complaint_data={
            "crime_category": complaint.crime_category,
            "crime_category_confidence": complaint.crime_category_confidence,
            "crime_indicators": complaint.crime_indicators or [],
            "risk_level": complaint.risk_level,
            "financial_loss": complaint.financial_loss,
            "payment_method": complaint.payment_method,
            "incident_description": description,
            "incident_date": complaint.incident_date,
        },
        entities=complaint.extracted_entities or {},
        timeline=timeline,
        evidence_files=evidence_files,
        incident_description=description,
    )
    complaint.complaint_text = complaint_text
    complaint.status = ComplaintStatus.COMPLETE

    # Generate title
    if not complaint.title:
        category = complaint.crime_category or "Cybercrime"
        complaint.title = f"{category} Complaint — {current_user.full_name}"

    db.add(complaint)

    return {
        "complaint_id": complaint.id,
        "title": complaint.title,
        "status": complaint.status,
        "crime_category": complaint.crime_category,
        "risk_level": complaint.risk_level,
        "incident_description": description,
        "complaint_text": complaint_text,
        "timeline": timeline,
        "evidence_checklist": complaint.evidence_checklist,
        "missing_info": complaint.missing_info,
        "extracted_entities": complaint.extracted_entities,
    }


@router.get("/{complaint_id}/pdf")
async def download_pdf(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download the complaint as a PDF."""
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id,
        )
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    if not complaint.complaint_text:
        raise HTTPException(
            status_code=400,
            detail="Complaint has not been generated yet. Call /generate first.",
        )

    ef_result = await db.execute(
        select(EvidenceFile).where(EvidenceFile.complaint_id == complaint_id)
    )
    evidence_files = ef_result.scalars().all()

    pdf_bytes = generate_complaint_pdf(
        user=current_user,
        complaint_data={
            "crime_category": complaint.crime_category,
            "crime_category_confidence": complaint.crime_category_confidence,
            "crime_indicators": complaint.crime_indicators or [],
            "risk_level": complaint.risk_level,
            "financial_loss": complaint.financial_loss,
            "payment_method": complaint.payment_method,
            "incident_description": complaint.incident_description,
            "incident_date": complaint.incident_date,
        },
        entities=complaint.extracted_entities or {},
        timeline=complaint.timeline or [],
        evidence_files=evidence_files,
        complaint_text=complaint.complaint_text,
    )

    filename = f"cybercrime_complaint_{complaint_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/list")
async def list_complaints(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all complaints for the current user."""
    result = await db.execute(
        select(Complaint)
        .where(Complaint.user_id == current_user.id)
        .order_by(Complaint.created_at.desc())
    )
    complaints = result.scalars().all()

    return {
        "complaints": [
            {
                "id": c.id,
                "title": c.title or f"Complaint #{c.id}",
                "status": c.status,
                "crime_category": c.crime_category,
                "risk_level": c.risk_level,
                "financial_loss": c.financial_loss,
                "created_at": c.created_at.isoformat(),
            }
            for c in complaints
        ]
    }


@router.get("/{complaint_id}")
async def get_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full complaint details."""
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id,
        )
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    ef_result = await db.execute(
        select(EvidenceFile).where(EvidenceFile.complaint_id == complaint_id)
    )
    evidence_files = ef_result.scalars().all()

    return {
        "id": complaint.id,
        "title": complaint.title,
        "status": complaint.status,
        "crime_category": complaint.crime_category,
        "crime_category_confidence": complaint.crime_category_confidence,
        "crime_indicators": complaint.crime_indicators,
        "risk_level": complaint.risk_level,
        "risk_score": complaint.risk_score,
        "risk_breakdown": complaint.risk_breakdown,
        "extracted_entities": complaint.extracted_entities,
        "missing_info": complaint.missing_info,
        "incident_description": complaint.incident_description,
        "complaint_text": complaint.complaint_text,
        "timeline": complaint.timeline,
        "evidence_checklist": complaint.evidence_checklist,
        "financial_loss": complaint.financial_loss,
        "payment_method": complaint.payment_method,
        "incident_date": complaint.incident_date.isoformat() if complaint.incident_date else None,
        "created_at": complaint.created_at.isoformat(),
        "evidence_files": [
            {
                "id": ef.id,
                "filename": ef.original_filename,
                "file_type": ef.file_type,
                "document_type": ef.document_type,
                "file_size_kb": round((ef.file_size or 0) / 1024, 1),
                "is_processed": ef.is_processed,
                "ocr_preview": (ef.ocr_text or "")[:300],
                "entities": ef.extracted_entities,
            }
            for ef in evidence_files
        ],
    }


@router.delete("/{complaint_id}")
async def delete_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a complaint and all associated evidence."""
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id,
        )
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    await db.delete(complaint)
    return {"message": "Complaint deleted successfully."}
