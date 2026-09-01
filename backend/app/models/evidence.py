from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class EvidenceFile(Base):
    __tablename__ = "evidence_files"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    original_filename = Column(String(500), nullable=False)
    stored_filename = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)   # 'image', 'pdf', 'text'
    file_size = Column(Integer, nullable=True)        # bytes
    mime_type = Column(String(100), nullable=True)

    # OCR Results
    ocr_text = Column(Text, nullable=True)
    extracted_entities = Column(JSON, default=dict)
    document_type = Column(String(100), nullable=True)  # 'bank_screenshot', 'offer_letter', etc.
    ocr_confidence = Column(Float, nullable=True)

    # Processing status
    is_processed = Column(Boolean, default=False)
    processing_error = Column(Text, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    complaint = relationship("Complaint", back_populates="evidence_files")
