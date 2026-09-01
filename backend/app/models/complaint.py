from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.core.database import Base


class CrimeCategory(str, enum.Enum):
    UPI_PAYMENT_FRAUD = "UPI / Payment Fraud"
    BANKING_FRAUD = "Banking Fraud"
    OTP_SOCIAL_ENGINEERING = "OTP / Social Engineering"
    PHISHING = "Phishing"
    JOB_EMPLOYMENT_FRAUD = "Job / Employment Fraud"
    INVESTMENT_FRAUD = "Investment Fraud"
    ECOMMERCE_FRAUD = "E-commerce Fraud"
    SOCIAL_MEDIA_FRAUD = "Social Media Fraud"
    ACCOUNT_COMPROMISE = "Account Compromise"
    IDENTITY_THEFT = "Identity Theft"
    IMPERSONATION = "Impersonation"
    CYBER_EXTORTION = "Cyber Extortion"
    MALWARE_RANSOMWARE = "Malware / Ransomware"
    CRYPTOCURRENCY_FRAUD = "Cryptocurrency Fraud"
    OTHER = "Other / Unknown"


class RiskLevel(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ComplaintStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETE = "COMPLETE"
    SUBMITTED = "SUBMITTED"


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=True)
    status = Column(SAEnum(ComplaintStatus), default=ComplaintStatus.DRAFT)

    # Classification
    crime_category = Column(SAEnum(CrimeCategory), nullable=True)
    crime_category_confidence = Column(Float, default=0.0)
    crime_indicators = Column(JSON, default=list)  # List of indicator strings

    # Risk
    risk_level = Column(SAEnum(RiskLevel), nullable=True)
    risk_score = Column(Float, default=0.0)
    risk_breakdown = Column(JSON, default=dict)

    # Extracted entities
    extracted_entities = Column(JSON, default=dict)  # {phones, amounts, upi_ids, txn_ids, ...}
    missing_info = Column(JSON, default=list)         # List of missing fields

    # Complaint content
    incident_description = Column(Text, nullable=True)
    complaint_text = Column(Text, nullable=True)     # Final generated complaint
    timeline = Column(JSON, default=list)             # Chronological events
    evidence_checklist = Column(JSON, default=dict)  # Category-specific checklist

    # Financials
    financial_loss = Column(Float, nullable=True)
    payment_method = Column(String(100), nullable=True)

    # Dates
    incident_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="complaints")
    evidence_files = relationship("EvidenceFile", back_populates="complaint", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="complaint", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    extracted_entities = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    complaint = relationship("Complaint", back_populates="chat_messages")
