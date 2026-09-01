import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.complaint import Complaint
from app.models.evidence import EvidenceFile
from app.ml.ocr_processor import process_file
from app.ml.ner_extractor import merge_entities

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])

ALLOWED_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff",
    "application/pdf", "text/plain",
}
MAX_SIZE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.post("/upload")
async def upload_evidence(
    complaint_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload an evidence file (image/PDF/text).
    Runs OCR/extraction and persists results.
    """
    # Verify complaint ownership
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id,
        )
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' is not allowed. Upload images, PDFs, or text files.",
        )

    # Read file bytes
    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    # Store file to disk
    upload_dir = Path(settings.UPLOAD_DIR) / str(current_user.id) / str(complaint_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(file.filename).suffix
    stored_name = f"{uuid.uuid4().hex}{ext}"
    stored_path = upload_dir / stored_name

    async with aiofiles.open(stored_path, "wb") as f:
        await f.write(file_bytes)

    # Process with OCR / document extraction
    try:
        ocr_result = process_file(file_bytes, file.filename, file.content_type)
        processing_error = ocr_result.get("error")
    except Exception as e:
        ocr_result = {"ocr_text": "", "entities": {}, "document_type": "unknown"}
        processing_error = str(e)

    # Save to DB
    evidence_record = EvidenceFile(
        complaint_id=complaint_id,
        original_filename=file.filename,
        stored_filename=str(stored_path),
        file_type=ocr_result.get("file_type", "unknown"),
        file_size=len(file_bytes),
        mime_type=file.content_type,
        ocr_text=ocr_result.get("ocr_text", ""),
        extracted_entities=ocr_result.get("entities", {}),
        document_type=ocr_result.get("document_type", "unknown"),
        ocr_confidence=ocr_result.get("confidence"),
        is_processed=not bool(processing_error),
        processing_error=processing_error,
    )
    db.add(evidence_record)
    await db.flush()
    await db.refresh(evidence_record)

    # Merge entities into complaint
    merged = merge_entities(
        complaint.extracted_entities or {},
        ocr_result.get("entities", {}),
    )
    complaint.extracted_entities = merged
    db.add(complaint)

    return {
        "evidence_id": evidence_record.id,
        "filename": file.filename,
        "document_type": evidence_record.document_type,
        "ocr_text": (ocr_result.get("ocr_text") or "")[:500],  # Preview
        "entities": ocr_result.get("entities", {}),
        "confidence": ocr_result.get("confidence"),
        "method": ocr_result.get("method", "unknown"),
        "processing_error": processing_error,
    }


@router.get("/file/{evidence_id}")
async def get_evidence_file(
    evidence_id: int,
    token: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Serve the raw evidence file."""
    # Find evidence file
    result = await db.execute(
        select(EvidenceFile).where(EvidenceFile.id == evidence_id)
    )
    ef = result.scalar_one_or_none()
    if not ef:
        raise HTTPException(status_code=404, detail="Evidence file not found.")

    file_path = Path(ef.stored_filename)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk.")

    from fastapi.responses import FileResponse
    return FileResponse(
        path=str(file_path),
        media_type=ef.mime_type or "application/octet-stream",
        filename=ef.original_filename,
    )


@router.get("/preview/{evidence_id}")
async def get_evidence_preview(
    evidence_id: int,
    token: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Serve a preview image for evidence (renders page 1 if PDF, or serves image)."""
    result = await db.execute(
        select(EvidenceFile).where(EvidenceFile.id == evidence_id)
    )
    ef = result.scalar_one_or_none()
    if not ef:
        raise HTTPException(status_code=404, detail="Evidence file not found.")

    file_path = Path(ef.stored_filename)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk.")

    from fastapi.responses import FileResponse, Response
    import io

    # If it's a PDF, render first page as PNG
    if ef.file_type == "pdf" or str(file_path).lower().endswith(".pdf"):
        try:
            import pymupdf
            pdf_doc = pymupdf.open(str(file_path))
            if len(pdf_doc) > 0:
                page = pdf_doc[0]
                pix = page.get_pixmap(dpi=150)
                img_bytes = pix.tobytes("png")
                return Response(content=img_bytes, media_type="image/png")
        except Exception:
            pass

    # If it's an image, serve directly
    if ef.file_type == "image" or str(file_path).lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff")):
        return FileResponse(
            path=str(file_path),
            media_type=ef.mime_type or "image/jpeg",
            filename=ef.original_filename,
        )

    # Fallback to serving raw file
    return FileResponse(
        path=str(file_path),
        media_type=ef.mime_type or "application/octet-stream",
        filename=ef.original_filename,
    )


@router.get("/{complaint_id}")
async def list_evidence(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all evidence files for a complaint."""
    # Verify ownership
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
    files = ef_result.scalars().all()

    return {
        "complaint_id": complaint_id,
        "evidence_files": [
            {
                "id": ef.id,
                "filename": ef.original_filename,
                "file_type": ef.file_type,
                "document_type": ef.document_type,
                "file_size_kb": round((ef.file_size or 0) / 1024, 1),
                "is_processed": ef.is_processed,
                "ocr_preview": (ef.ocr_text or "")[:200],
                "entities": ef.extracted_entities,
                "uploaded_at": ef.uploaded_at.isoformat(),
            }
            for ef in files
        ],
    }


@router.delete("/{evidence_id}")
async def delete_evidence(
    evidence_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an evidence file."""
    result = await db.execute(
        select(EvidenceFile)
        .join(Complaint)
        .where(
            EvidenceFile.id == evidence_id,
            Complaint.user_id == current_user.id,
        )
    )
    ef = result.scalar_one_or_none()
    if not ef:
        raise HTTPException(status_code=404, detail="Evidence file not found.")

    # Delete from disk
    try:
        Path(ef.stored_filename).unlink(missing_ok=True)
    except Exception:
        pass

    await db.delete(ef)
    return {"message": "Evidence file deleted."}

