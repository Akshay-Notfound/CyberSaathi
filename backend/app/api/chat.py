from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.complaint import Complaint, ChatMessage, ComplaintStatus
from app.ml.ner_extractor import extract_entities, merge_entities
from app.ml.classifier import get_classifier
from app.ml.risk_scorer import calculate_risk, RiskInput
from app.services.gemini_service import get_gemini_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])


# ─── Schemas ──────────────────────────────────────────────────────────────────

class ChatMessageIn(BaseModel):
    complaint_id: Optional[int] = None
    message: str


class ChatResponse(BaseModel):
    complaint_id: int
    reply: str
    extracted_entities: Dict[str, Any]
    classification: Dict[str, Any]
    risk: Dict[str, Any]
    missing_info: List[str]
    evidence_checklist: List[str]


class StartComplaintResponse(BaseModel):
    complaint_id: int
    message: str


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/start", response_model=StartComplaintResponse, status_code=201)
async def start_complaint(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new complaint session and return complaint ID."""
    complaint = Complaint(user_id=current_user.id, status=ComplaintStatus.IN_PROGRESS)
    db.add(complaint)
    await db.flush()
    await db.refresh(complaint)

    # Add a welcome message
    welcome_msg = ChatMessage(
        complaint_id=complaint.id,
        role="assistant",
        content=(
            "Namaste! I'm CyberSaathi, your AI cybercrime complaint assistant. "
            "I'm here to help you document and report a cybercrime incident. "
            "Please tell me what happened — describe the incident in your own words. "
            "You can also upload screenshots or documents to help me analyze the evidence."
        ),
        extracted_entities={},
    )
    db.add(welcome_msg)

    return StartComplaintResponse(
        complaint_id=complaint.id,
        message="Complaint session started.",
    )


@router.post("/message", response_model=ChatResponse)
async def send_message(
    data: ChatMessageIn,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Process a user's chat message:
    1. Extract entities from text
    2. Classify crime type
    3. Calculate risk
    4. Get Gemini reply
    5. Detect missing info
    6. Persist message and update complaint
    """
    # Get or create complaint
    complaint = None
    if data.complaint_id:
        result = await db.execute(
            select(Complaint).where(
                Complaint.id == data.complaint_id,
                Complaint.user_id == current_user.id,
            )
        )
        complaint = result.scalar_one_or_none()

    if not complaint:
        complaint = Complaint(user_id=current_user.id, status=ComplaintStatus.IN_PROGRESS)
        db.add(complaint)
        await db.flush()
        await db.refresh(complaint)

    # 1. Extract entities from this message
    new_entities = extract_entities(data.message)

    # 2. Merge with existing complaint entities
    existing_entities = complaint.extracted_entities or {}
    merged_entities = merge_entities(existing_entities, new_entities)

    # 3. Load full conversation history
    history_result = await db.execute(
        select(ChatMessage).where(ChatMessage.complaint_id == complaint.id).order_by(ChatMessage.id)
    )
    all_messages = history_result.scalars().all()

    # Build conversation text for classification
    user_messages_text = " ".join(
        msg.content for msg in all_messages if msg.role == "user"
    ) + " " + data.message

    # 4. Classify crime type
    classifier = get_classifier()
    classification = classifier.predict(user_messages_text)

    # 5. Update financial loss from entities
    financial_loss = 0.0
    if merged_entities.get("amounts"):
        import re
        for amt_str in merged_entities["amounts"]:
            num_str = re.sub(r"[₹,\s]", "", amt_str)
            try:
                val = float(num_str)
                if val > financial_loss:
                    financial_loss = val
            except ValueError:
                pass

    # 6. Detect risk signals from text
    msg_lower = data.message.lower()
    risk_input = RiskInput(
        financial_loss=financial_loss,
        account_compromised=any(k in msg_lower for k in ["account hacked", "lost access", "locked out"]),
        otp_shared=any(k in msg_lower for k in ["shared otp", "gave otp", "told otp", "otp share"]),
        password_shared=any(k in msg_lower for k in ["shared password", "gave password"]),
        credentials_exposed=any(k in msg_lower for k in ["entered credentials", "login details", "username password"]),
        ongoing_attack=any(k in msg_lower for k in ["still happening", "ongoing", "right now", "currently"]),
        identity_exposed=any(k in msg_lower for k in ["aadhaar", "pan card", "identity"]),
        extortion_threat=any(k in msg_lower for k in ["threatening", "blackmail", "threat", "extortion"]),
        malware_present=any(k in msg_lower for k in ["virus", "malware", "ransomware", "hacked device"]),
        crime_category=classification.get("category", ""),
    )
    risk_result = calculate_risk(risk_input)

    # 7. Get Gemini response
    gemini = get_gemini_service()
    history_for_gemini = [
        {"role": "model" if msg.role == "assistant" else "user", "content": msg.content}
        for msg in all_messages
    ]

    incident_context = {
        "crime_category": classification.get("category"),
        "financial_loss": financial_loss if financial_loss > 0 else None,
        "risk_level": risk_result.level,
        "missing_info": [],
    }

    bot_reply = gemini.chat(
        user_message=data.message,
        history=history_for_gemini,
        incident_context=incident_context,
    )

    # 8. Detect missing information
    missing_info = gemini.detect_missing_info(
        crime_category=classification.get("category", ""),
        extracted_entities=merged_entities,
        conversation_summary=user_messages_text[:500],
    )
    incident_context["missing_info"] = missing_info

    # 9. Evidence checklist for this crime type
    evidence_checklist = gemini.get_evidence_checklist(classification.get("category", ""))

    # 10. Save user message
    user_msg = ChatMessage(
        complaint_id=complaint.id,
        role="user",
        content=data.message,
        extracted_entities=new_entities,
    )
    db.add(user_msg)

    # 11. Save bot reply
    bot_msg = ChatMessage(
        complaint_id=complaint.id,
        role="assistant",
        content=bot_reply,
        extracted_entities={},
    )
    db.add(bot_msg)

    # 12. Update complaint with latest analysis
    complaint.extracted_entities = merged_entities
    complaint.crime_category = classification.get("category")
    complaint.crime_category_confidence = classification.get("confidence", 0.0)
    complaint.crime_indicators = classification.get("indicators", [])
    complaint.risk_level = risk_result.level
    complaint.risk_score = risk_result.score
    complaint.risk_breakdown = risk_result.breakdown
    complaint.financial_loss = financial_loss if financial_loss > 0 else complaint.financial_loss
    complaint.missing_info = missing_info
    complaint.evidence_checklist = {"items": evidence_checklist}
    db.add(complaint)

    return ChatResponse(
        complaint_id=complaint.id,
        reply=bot_reply,
        extracted_entities=merged_entities,
        classification={
            "category": classification.get("category"),
            "confidence": classification.get("confidence"),
            "indicators": classification.get("indicators", []),
            "alternatives": classification.get("alternatives", []),
        },
        risk={
            "level": risk_result.level,
            "score": risk_result.score,
            "breakdown": risk_result.breakdown,
            "immediate_actions": risk_result.immediate_actions,
            "explanation": risk_result.explanation,
        },
        missing_info=missing_info,
        evidence_checklist=evidence_checklist,
    )


@router.get("/{complaint_id}/history")
async def get_chat_history(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the full chat history for a complaint."""
    result = await db.execute(
        select(Complaint).where(
            Complaint.id == complaint_id,
            Complaint.user_id == current_user.id,
        )
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found.")

    msgs_result = await db.execute(
        select(ChatMessage).where(ChatMessage.complaint_id == complaint_id).order_by(ChatMessage.id)
    )
    messages = msgs_result.scalars().all()

    return {
        "complaint_id": complaint_id,
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "extracted_entities": msg.extracted_entities,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in messages
        ],
    }
