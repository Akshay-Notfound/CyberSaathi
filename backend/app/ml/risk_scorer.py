"""
Cybercrime Risk Scorer.
Estimates urgency/priority of a cybercrime incident using a weighted scoring model.
Outputs: CRITICAL / HIGH / MEDIUM / LOW with a detailed breakdown.
"""

from dataclasses import dataclass, field
from typing import Dict, Optional


@dataclass
class RiskInput:
    """All factors contributing to risk/urgency scoring."""
    # Financial impact
    financial_loss: float = 0.0        # Amount in ₹
    # Account/credential status
    account_compromised: bool = False
    otp_shared: bool = False
    password_shared: bool = False
    pin_shared: bool = False
    credentials_exposed: bool = False
    # Ongoing threat
    ongoing_attack: bool = False       # Attack still happening
    # Identity
    identity_exposed: bool = False     # Aadhaar, PAN, etc. shared
    # Threat level
    extortion_threat: bool = False     # Threats / blackmail
    malware_present: bool = False      # Device infected
    # Time
    hours_since_incident: Optional[float] = None  # Hours elapsed
    # Extra context
    crime_category: str = ""


@dataclass
class RiskOutput:
    level: str          # CRITICAL / HIGH / MEDIUM / LOW
    score: float        # 0-100
    breakdown: Dict[str, float] = field(default_factory=dict)
    immediate_actions: list = field(default_factory=list)
    explanation: str = ""


# ─── Scoring Weights ───────────────────────────────────────────────────────────

FINANCIAL_THRESHOLDS = [
    (500_000, 35),   # > ₹5 Lakh  → 35 pts
    (100_000, 28),   # > ₹1 Lakh  → 28 pts
    (50_000,  20),   # > ₹50k     → 20 pts
    (10_000,  12),   # > ₹10k     → 12 pts
    (1_000,    6),   # > ₹1k      →  6 pts
    (0,        2),   # Any loss   →  2 pts
]

BOOLEAN_WEIGHTS = {
    "account_compromised": 20,
    "otp_shared":          15,
    "password_shared":     18,
    "pin_shared":          18,
    "credentials_exposed": 15,
    "ongoing_attack":      25,
    "identity_exposed":    12,
    "extortion_threat":    20,
    "malware_present":     18,
}

TIME_BONUSES = [
    (1,  10),   # < 1 hr  → extra 10 pts urgency
    (6,   7),   # < 6 hrs → extra 7 pts
    (24,  4),   # < 24hrs → extra 4 pts
]

RISK_THRESHOLDS = {
    "CRITICAL": 65,
    "HIGH":     40,
    "MEDIUM":   20,
    "LOW":       0,
}

IMMEDIATE_ACTION_MAP = {
    "CRITICAL": [
        "🚨 Call the National Cybercrime Helpline: 1930 immediately",
        "🔒 Block all affected bank cards/accounts immediately",
        "📱 Change passwords for all compromised accounts NOW",
        "🏦 Contact your bank's fraud department immediately",
        "📋 Do NOT delete any messages, screenshots, or evidence",
        "🌐 Report on cybercrime.gov.in immediately",
    ],
    "HIGH": [
        "📞 Report on cybercrime.gov.in within the next few hours",
        "🔒 Freeze/block affected payment instruments",
        "📱 Change passwords for affected accounts",
        "💾 Save all evidence (screenshots, messages, transaction IDs)",
        "🏦 Inform your bank about the fraud",
    ],
    "MEDIUM": [
        "📋 File a complaint on cybercrime.gov.in",
        "💾 Preserve all digital evidence",
        "📱 Review and secure your account settings",
        "📸 Collect all relevant screenshots and documents",
    ],
    "LOW": [
        "📋 Document the incident thoroughly",
        "📞 Consider reporting to cybercrime.gov.in for awareness",
        "⚠️ Stay alert for follow-up scam attempts",
        "💡 Educate yourself on similar fraud patterns",
    ],
}


def calculate_risk(inp: RiskInput) -> RiskOutput:
    """
    Calculate a risk score from 0–100 and return a risk level.
    """
    breakdown: Dict[str, float] = {}
    total_score = 0.0

    # 1. Financial impact
    fin_score = 0.0
    for threshold, pts in FINANCIAL_THRESHOLDS:
        if inp.financial_loss > threshold:
            fin_score = pts
            break
    breakdown["financial_impact"] = fin_score
    total_score += fin_score

    # 2. Boolean risk factors
    for factor, weight in BOOLEAN_WEIGHTS.items():
        if getattr(inp, factor, False):
            breakdown[factor] = float(weight)
            total_score += weight

    # 3. Time-based urgency bonus
    time_bonus = 0.0
    if inp.hours_since_incident is not None:
        for hours, bonus in TIME_BONUSES:
            if inp.hours_since_incident <= hours:
                time_bonus = bonus
                break
    breakdown["time_urgency"] = time_bonus
    total_score += time_bonus

    # Cap at 100
    total_score = min(total_score, 100.0)

    # 4. Determine level
    level = "LOW"
    for lvl, threshold in RISK_THRESHOLDS.items():
        if total_score >= threshold:
            level = lvl
            break

    # 5. Build explanation
    top_factors = sorted(breakdown.items(), key=lambda x: x[1], reverse=True)
    top_3 = [f for f in top_factors if f[1] > 0][:3]
    factor_labels = {
        "financial_impact": "significant financial loss",
        "account_compromised": "account compromise",
        "otp_shared": "OTP disclosure",
        "password_shared": "password exposure",
        "pin_shared": "PIN disclosure",
        "credentials_exposed": "credential exposure",
        "ongoing_attack": "ongoing attack",
        "identity_exposed": "identity information exposure",
        "extortion_threat": "active extortion threat",
        "malware_present": "malware / ransomware presence",
        "time_urgency": "recent incident (time-critical)",
    }
    reason_parts = [factor_labels.get(k, k) for k, _ in top_3]
    explanation = f"Risk classified as {level} (score: {total_score:.0f}/100)."
    if reason_parts:
        explanation += f" Key factors: {', '.join(reason_parts)}."

    return RiskOutput(
        level=level,
        score=round(total_score, 1),
        breakdown=breakdown,
        immediate_actions=IMMEDIATE_ACTION_MAP[level],
        explanation=explanation,
    )


def risk_from_dict(data: dict) -> RiskOutput:
    """Convenience wrapper accepting a plain dict."""
    inp = RiskInput(**{k: v for k, v in data.items() if hasattr(RiskInput, k)})
    return calculate_risk(inp)


if __name__ == "__main__":
    sample = RiskInput(
        financial_loss=40000,
        otp_shared=True,
        account_compromised=True,
        hours_since_incident=0.5,
    )
    result = calculate_risk(sample)
    print(f"Level: {result.level}")
    print(f"Score: {result.score}")
    print(f"Explanation: {result.explanation}")
    print("Immediate actions:")
    for action in result.immediate_actions:
        print(f"  {action}")
