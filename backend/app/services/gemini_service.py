"""
Google Gemini API service for conversational intelligence.
Manages system prompts, conversation history, guided questioning,
missing information detection, and context-aware responses.
"""

import json
from typing import List, Dict, Optional, Any

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from app.core.config import settings


# ─── System Prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are CyberSaathi, an AI-powered cybercrime complaint assistant developed to help victims in India analyze and document cybercrime incidents.

Your role is to:
1. Listen empathetically to the victim's description of the cybercrime
2. Ask targeted follow-up questions to extract missing important information
3. Guide the victim step-by-step through describing their incident completely
4. Help identify what type of cybercrime occurred based on their description
5. Remind victims to preserve evidence without deleting anything
6. Provide immediate safety guidance when urgency is high

IMPORTANT GUIDELINES:
- Be empathetic, patient, and non-judgmental — victims may be distressed
- Ask ONE focused question at a time, not multiple questions at once
- Always acknowledge what the user has shared before asking follow-up questions
- Extract key details: amounts, phone numbers, UPI IDs, transaction IDs, dates, times
- If the attack is ongoing or critical, immediately advise calling 1930 (National Cybercrime Helpline)
- Do NOT make legal determinations or guarantee outcomes
- Do NOT access any external systems or claim to file complaints automatically
- Use simple, clear language — avoid technical jargon
- Support both English and Hindi/Hinglish responses naturally

INFORMATION TO GATHER (progressively, not all at once):
- What happened (incident description)
- When it happened (date and time)
- Financial loss amount
- Payment method used (UPI/card/bank transfer)
- Transaction ID / UTR number
- Phone number / UPI ID / email of suspect
- Which bank or payment app was used
- Whether accounts are still compromised
- What evidence they have

RESPONSE FORMAT:
Always respond in plain, conversational text. Do not use markdown headers or lists in responses — keep it natural like a helpful assistant speaking directly to the victim.

If the incident is CRITICAL (ongoing attack, account compromised, large financial loss), start your response with: "⚠️ URGENT:" and immediately advise calling 1930."""


MISSING_INFO_CATEGORIES = {
    "UPI / Payment Fraud": ["transaction_date", "transaction_id", "suspect_upi_id", "amount", "bank_name", "payment_app"],
    "Banking Fraud": ["account_number", "transaction_date", "unauthorized_amount", "bank_name", "card_type"],
    "OTP / Social Engineering": ["caller_phone", "otp_shared", "amount_lost", "bank_name", "date"],
    "Phishing": ["phishing_url", "data_entered", "amount_lost", "date", "email_or_sms"],
    "Job / Employment Fraud": ["company_name", "payment_amount", "upi_id_used", "contact_phone", "platform"],
    "Investment Fraud": ["amount_invested", "platform_name", "agent_contact", "date_started"],
    "E-commerce Fraud": ["order_details", "seller_contact", "payment_amount", "platform"],
    "Cyber Extortion": ["threat_nature", "demand_amount", "contact_method", "any_payment_made"],
    "Account Compromise": ["compromised_platform", "date_discovered", "suspicious_activity"],
    "Identity Theft": ["which_documents_misused", "how_discovered", "reported_to_institution"],
}


# ─── Gemini Client ────────────────────────────────────────────────────────────

class GeminiService:

    def __init__(self):
        self.model = None
        self._initialize()

    def _initialize(self):
        if not GEMINI_AVAILABLE:
            print("WARNING: google-generativeai not installed. Using mock responses.")
            return

        if not settings.GEMINI_API_KEY:
            print("WARNING: GEMINI_API_KEY not set. Using mock responses.")
            return

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=SYSTEM_PROMPT,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.4,
                    top_p=0.9,
                    max_output_tokens=600,
                ),
            )
            print("SUCCESS: Gemini API initialized")
        except Exception as e:
            print(f"WARNING: Failed to initialize Gemini: {e}")

    def chat(
        self,
        user_message: str,
        history: List[Dict[str, str]],
        incident_context: Optional[Dict] = None,
    ) -> str:
        """
        Send a message to Gemini with conversation history.

        Args:
            user_message: Latest user message
            history: Previous messages as [{"role": "user"/"model", "parts": "..."}]
            incident_context: Current extracted incident data (entities, classification, etc.)

        Returns:
            Assistant reply string
        """
        if self.model is None:
            return self._mock_response(user_message, incident_context)

        try:
            # Inject context into the conversation if available
            context_note = ""
            if incident_context:
                context_note = self._build_context_note(incident_context)

            # Build history for Gemini
            gemini_history = []
            for msg in history[:-1]:  # All but the last (which is the current message)
                gemini_history.append({
                    "role": msg["role"],
                    "parts": [msg["content"]],
                })

            chat_session = self.model.start_chat(history=gemini_history)

            full_message = user_message
            if context_note:
                full_message = f"{user_message}\n\n[System context: {context_note}]"

            response = chat_session.send_message(full_message)
            return response.text

        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._mock_response(user_message, incident_context)

    def detect_missing_info(
        self,
        crime_category: str,
        extracted_entities: Dict,
        conversation_summary: str,
    ) -> List[str]:
        """Determine what key information is still missing from the complaint."""
        required_fields = MISSING_INFO_CATEGORIES.get(crime_category, [])
        entity_values = {k: v for k, v in extracted_entities.items() if v}

        missing = []
        field_map = {
            "transaction_id": "transaction_ids",
            "suspect_upi_id": "upi_ids",
            "amount": "amounts",
            "bank_name": "banks",
            "caller_phone": "phone_numbers",
            "phishing_url": "urls",
        }

        for field in required_fields:
            mapped = field_map.get(field, field)
            if not entity_values.get(mapped):
                missing.append(field.replace("_", " ").title())

        return missing[:5]  # Return top 5 missing

    def generate_complaint_description(
        self,
        incident_data: Dict,
        conversation_text: str,
    ) -> str:
        """Generate a polished incident description paragraph using Gemini."""
        if self.model is None:
            return self._mock_complaint_description(incident_data)

        prompt = f"""Based on this cybercrime incident data, write a clear, factual, 
and detailed incident description suitable for an official complaint. 
Write in first person. Include all key facts. Do not add any information 
that is not provided. Be precise and professional.

Incident Data:
{json.dumps(incident_data, indent=2, default=str)}

Conversation Summary:
{conversation_text[:1000]}

Write ONLY the incident description paragraph, nothing else."""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return self._mock_complaint_description(incident_data)

    def get_evidence_checklist(self, crime_category: str) -> List[str]:
        """Return category-specific evidence checklist items."""
        checklists = {
            "UPI / Payment Fraud": [
                "Screenshot of UPI transaction", "Transaction ID / UTR number",
                "Suspect's UPI ID", "Bank SMS / email notification",
                "Bank statement showing debit", "Any conversation with suspect",
                "Suspect's phone number",
            ],
            "Banking Fraud": [
                "Bank statement showing unauthorized transactions",
                "Debit/credit card details (do NOT share CVV/PIN)", "ATM CCTV request",
                "Any SMS/email alerts received", "FIR copy if applicable",
            ],
            "OTP / Social Engineering": [
                "Call recordings (if any)", "SMS showing OTP was sent",
                "Bank SMS showing debit", "Caller's phone number",
                "Bank transaction screenshot",
            ],
            "Phishing": [
                "Screenshot of phishing email/SMS", "Phishing URL",
                "Screenshots of fake website", "Bank transaction records",
                "Email headers (forward full email)",
            ],
            "Job / Employment Fraud": [
                "Fake offer letter / job posting screenshot",
                "Payment receipts / transaction screenshots",
                "Conversation with recruiter (WhatsApp/email)",
                "Job portal link or ad screenshot",
                "Suspect's phone number and email",
            ],
            "Investment Fraud": [
                "Screenshots of investment platform / app",
                "Transaction records of all investments",
                "Conversation with agent (Telegram/WhatsApp)",
                "Advertised returns / scheme details",
                "Bank statements showing transfers",
            ],
            "E-commerce Fraud": [
                "Order confirmation screenshot", "Payment receipt",
                "Seller's contact details", "Product listing screenshot",
                "Delivery tracking info (or lack thereof)",
                "Conversation with seller",
            ],
            "Cyber Extortion": [
                "Screenshots of threats/demands",
                "Suspect's contact details",
                "Any payment receipts made to extortionist",
                "Original content being threatened with (if appropriate)",
                "Call recordings if available",
            ],
            "Account Compromise": [
                "Screenshot of unauthorized activity",
                "Account recovery details", "Any suspicious login notifications",
                "Platform's support ticket reference",
            ],
            "Identity Theft": [
                "Documents misused (e.g., Aadhaar, PAN)", "Loan/account details",
                "Letter from institution confirming fraudulent account",
                "Credit report showing unauthorized credit",
            ],
            "Malware / Ransomware": [
                "Screenshot of ransom note / malware message",
                "List of affected files/systems",
                "Any email/message that led to infection",
                "Device details",
            ],
        }
        return checklists.get(crime_category, [
            "All relevant screenshots",
            "Transaction records",
            "Suspect contact details",
            "Conversation logs",
            "Any documents received",
        ])

    def _build_context_note(self, ctx: Dict) -> str:
        parts = []
        if ctx.get("crime_category"):
            parts.append(f"Detected crime type: {ctx['crime_category']}")
        if ctx.get("financial_loss"):
            parts.append(f"Financial loss: ₹{ctx['financial_loss']}")
        if ctx.get("risk_level"):
            parts.append(f"Risk level: {ctx['risk_level']}")
        if ctx.get("missing_info"):
            parts.append(f"Still needed: {', '.join(ctx['missing_info'][:3])}")
        return ". ".join(parts)

    def _mock_response(self, message: str, context: Optional[Dict] = None) -> str:
        """Fallback mock response when Gemini is not available."""
        msg_lower = message.lower()
        if any(kw in msg_lower for kw in ["otp", "share"]):
            return ("⚠️ URGENT: If you shared your OTP, please call the National Cybercrime "
                    "Helpline at 1930 immediately and ask your bank to freeze your account. "
                    "Was any amount debited from your account after sharing the OTP?")
        elif any(kw in msg_lower for kw in ["fraud", "scam", "cheated", "lost"]):
            return ("I'm sorry to hear that. To help you file a complete complaint, "
                    "I need a few more details. Can you tell me approximately how much "
                    "money was lost, and do you have a transaction ID or screenshot?")
        else:
            return ("I understand. Please describe what happened — when did this occur, "
                    "what was the amount involved, and do you have any transaction details "
                    "like a UTR number or UPI ID?")

    def _mock_complaint_description(self, data: Dict) -> str:
        category = data.get("crime_category", "cybercrime")
        amount = data.get("financial_loss") or 0
        return (f"I am writing to report a {category} incident in which I suffered "
                f"a financial loss of ₹{amount:,.0f}. The details of the incident are "
                f"as described in this complaint. I request the appropriate authorities "
                f"to investigate the matter and take necessary action.")


# ─── Global Singleton ──────────────────────────────────────────────────────────

_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
