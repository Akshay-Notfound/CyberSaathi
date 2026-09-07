# 🛡️ CyberSaathi — AI-Powered Cyber Crime Complaint & Assistance System

> **Machine Learning + NLP + OCR + Conversational AI** for cybercrime complaint analysis and reporting.

---

## 📌 Problem Statement

Cybercrime victims often struggle to file complete, structured reports because they don't know what information matters, can't describe technical incidents clearly, have evidence scattered across screenshots and messages, and don't know which authority to contact.

**CyberSaathi** is a conversational assistant that turns an unstructured victim account — plus any screenshots, PDFs, or receipts they upload — into a classified, risk-scored, structured complaint draft with an evidence checklist and incident timeline.

> **Disclaimer**: This is an AI-assisted decision-support tool, not a law-enforcement replacement. It never auto-submits anything; every draft is reviewed and confirmed by the user before it goes anywhere.

---

## 🚀 Features & Technologies

| Feature | Technology |
| :--- | :--- |
| **Conversational Incident Intake** | Rule-based engine, with optional Google Gemini API upgrade |
| **Crime Type Classification (15 categories)** | TF-IDF + Naive Bayes / Logistic Regression / Linear SVM / Random Forest |
| **Risk / Urgency Scoring** | Weighted multi-factor scoring model |
| **Entity Extraction** | Regex & NLP NER (phones, UPI IDs, amounts, transaction IDs, URLs, dates...) |
| **Evidence OCR Analysis** | Tesseract OCR (images) + PyMuPDF (PDFs, incl. scanned pages) |
| **Complaint Generation** | Structured 10-section template, optionally polished by Gemini |
| **PDF Export** | ReportLab |
| **Model Comparison Dashboard** | Chart.js via `react-chartjs-2` |
| **Incident Timeline** | Deterministic chronological reconstruction |
| **Evidence Checklist** | Category-specific, auto-selected |
| **Authentication & Security** | JWT + bcrypt password hashing |

> The system works fully without any Gemini API key — it falls back to a rule-based conversational engine and a deterministic complaint template. Adding a free Gemini key upgrades the conversation and narrative quality but is never required.

---

## 📁 Project Structure

```text
cybersaathi/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entrypoint
│   │   ├── api/                        # auth, chat, complaints, evidence, ml routers
│   │   ├── core/                       # config, database, security (JWT/bcrypt)
│   │   ├── ml/                         # classifier, NER, risk scorer, OCR
│   │   │   └── artifacts/              # trained vectorizer + model + comparison.json
│   │   ├── models/                     # SQLAlchemy models
│   │   ├── schemas/                    # Pydantic schemas
│   │   └── services/                   # Gemini wrapper, chat engine, complaint generator,
│   │                                   # checklists, timeline, PDF export
│   ├── ml_training/
│   │   ├── dataset/                    # labeled training CSV (15 categories)
│   │   ├── generate_dataset.py         # regenerates the training dataset
│   │   └── train_classifier.py         # trains & compares all 4 models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/                      # Landing, Login, Register, Dashboard, Chat, Evidence,
│   │   │                               # ComplaintDraft, MLDashboard
│   │   ├── components/                 # Navbar, CaseSidebar, RiskBadge, EntityPanel,
│   │   │                               # ChecklistPanel, TimelinePanel, ModelComparisonChart
│   │   ├── store/                      # Zustand: authStore, complaintStore
│   │   └── api/client.js               # Axios instance with JWT interceptor
│   ├── vite.config.js                  # Vite dev proxy configuration
│   └── index.html
├── docker-compose.yml                  # PostgreSQL + pgAdmin
└── LICENSE
```

---

## 🖥️ Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Docker Desktop** (for PostgreSQL) — or point `DATABASE_URL` at any Postgres instance (e.g. Supabase)
- **Tesseract OCR** installed and on PATH ([Windows installer](https://github.com/UB-Mannheim/tesseract/wiki), `brew install tesseract` on macOS, `apt install tesseract-ocr` on Linux)
- *(Optional)* Free Gemini API key from [aistudio.google.com](https://aistudio.google.com/)

---

### 1. Start PostgreSQL (Optional if using Supabase)
```bash
docker-compose up -d
```
*This also starts pgAdmin at `http://localhost:5050` (`admin@cybercrime.local` / `admin123`).*

---

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Train the classifiers (first time only)
python -m ml_training.train_classifier

# Start the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API documentation is accessible at **`http://localhost:8000/api/docs`**.

---

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env   # Leave VITE_API_URL blank for local dev (uses Vite proxy)
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🤖 ML Models

`ml_training/train_classifier.py` trains and compares four TF-IDF based classifiers on the labeled dataset:

| Model | Notes |
| :--- | :--- |
| **Multinomial Naive Bayes** | Fast baseline |
| **Logistic Regression** | Strong general-purpose text classifier |
| **Linear SVM** | Typically the most accurate on TF-IDF features |
| **Random Forest** | Ensemble, robust to noisy phrasing |

The best model by weighted F1 score is saved to `backend/models/` and served by the API; all four models' metrics are saved and rendered on the **Model Insights** dashboard in the app.

### 15 Recognized Crime Categories:
*UPI Fraud · Banking Fraud · OTP Scams · Phishing · Job Fraud · Investment Fraud · E-commerce Fraud · Social Media Fraud · Account Compromise · Identity Theft · Impersonation · Cyber Extortion · Malware/Ransomware · Cryptocurrency Fraud · Other*

---

## 🔒 Security Notes
- **JWT Authentication** with bcrypt password hashing
- **File Upload Validation** (extension allow-list + size limits) before disk write
- **Evidence Storage**: Stored server-side under `uploads/`, never inlined into the database
- **CORS Protection**: Restricted to configured origins in `.env`
- Set a long, random `SECRET_KEY` before deploying to production

---

## 📤 Publishing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: CyberSaathi AI cybercrime complaint assistant"
git branch -M main
git remote add origin https://github.com/<your-username>/cybersaathi.git
git push -u origin main
```

---

## 🌐 Deployment Architecture

A simple, free-tier-friendly split:
* **Backend**: [Render](https://render.com), [Railway](https://railway.app), or [Fly.io]. Set environment variables from `.env.example`.
* **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Set `VITE_API_URL` to your deployed backend's URL (e.g. `https://cybersaathi-api.onrender.com/api`).
* **Database**: [Supabase](https://supabase.com) managed PostgreSQL.

---

## 📞 Emergency Resources

| Resource | Contact / Link |
| :--- | :--- |
| **National Cybercrime Helpline** | **1930** |
| **Official Reporting Portal** | [cybercrime.gov.in](https://cybercrime.gov.in) |
| **RBI Ombudsman** | [bankingombudsman.rbi.org.in](https://bankingombudsman.rbi.org.in) |
| **CERT-In** | [cert-in.org.in](https://cert-in.org.in) |

---

## 📜 Disclaimer

CyberSaathi is an AI-assisted decision-support tool for complaint preparation. It does not replace law enforcement authorities, make legal determinations, or automatically file official complaints. All information submitted to any official portal must be reviewed and confirmed by the user.

**CyberSaathi — AI-Powered Cyber Crime Complaint & Assistance System · MIT License**
