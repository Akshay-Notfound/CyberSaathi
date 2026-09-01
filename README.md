# 🛡️ AI-Powered Cyber Crime Complaint & Assistance System

> **CyberSaathi** — Machine Learning + NLP + OCR + Conversational AI for cybercrime complaint analysis and reporting

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build-Vite%208-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Tesseract OCR](https://img.shields.io/badge/OCR-Tesseract-5C6BC0?style=flat-square&logo=google&logoColor=white)](https://github.com/tesseract-ocr/tesseract)
[![PyMuPDF](https://img.shields.io/badge/PDF%20Parser-PyMuPDF-D32F2F?style=flat-square&logo=adobe-acrobat-reader&logoColor=white)](https://pymupdf.readthedocs.io)
[![ReportLab](https://img.shields.io/badge/PDF%20Export-ReportLab-FF7043?style=flat-square&logo=adobe&logoColor=white)](https://www.reportlab.com)
[![JWT Auth](https://img.shields.io/badge/Security-JWT%20%2B%20Bcrypt-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Chart.js](https://img.shields.io/badge/Analytics-Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 📌 Problem Statement

Cybercrime victims often struggle to provide complete, structured reports due to:
- Not knowing what information is important
- Difficulty describing technical incidents clearly
- Scattered evidence across screenshots, SMS, emails, and documents
- Not knowing which authority to report to

This system uses **ML, NLP, OCR, and conversational AI** to transform unstructured victim reports into complete, categorized, risk-prioritized complaint documents.

---

## 🚀 Features

| Feature | Technology |
|---------|-----------|
| Conversational incident intake | Google Gemini API (CyberSaathi chatbot) |
| Crime type classification | Naive Bayes / SVM / Random Forest / Logistic Regression (TF-IDF) |
| Risk/urgency scoring | Weighted multi-factor scoring model |
| Entity extraction | Regex NER pipeline (phones, UPI IDs, amounts, txn IDs) |
| Evidence OCR analysis | Tesseract OCR + PyMuPDF |
| Complaint generation | Structured 10-section template + Gemini |
| PDF export | ReportLab professional PDF |
| Model comparison dashboard | Chart.js accuracy/F1 comparison |
| Incident timeline | Chronological event reconstruction |
| Evidence checklist | Category-specific checklist with auto-detection |

---

## 🖥️ GUI Workflow & User Journey

```mermaid
flowchart TD
    subgraph UI["🖥️ Frontend GUI Navigation (React + Vite)"]
        LP["🏠 Landing Page<br/>Overview & Emergency Contacts"]
        AU["🔐 Auth System<br/>Secure JWT Login / Register"]
        DB["📊 User Dashboard<br/>Complaint History & Quick Actions"]
        CH["💬 CyberSaathi AI Chatbot<br/>• Conversational Incident Intake<br/>• Real-time Entity Detection<br/>• Dynamic Evidence Checklist<br/>• Live Risk Scoring"]
        EV["📁 Evidence Processing Lab<br/>• OCR Screenshot & Document Scan<br/>• Visual File Previews<br/>• Entity Auto-extraction"]
        CP["📋 Complaint Review & Export<br/>• Structured 10-Section Legal Template<br/>• Embedded Image & PDF Exhibits<br/>• Chronological Timeline"]
        MC["📈 ML Model Benchmark<br/>• Real-time Classifier Comparison<br/>• Accuracy, Precision, F1-Score Charts"]
    end

    LP --> AU
    AU --> DB
    DB --> CH
    CH --> EV
    EV --> CP
    DB --> CP
    DB --> MC
    CP --> PDF["📄 Download Official PDF Complaint"]
```

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TB
    subgraph Client["🖥️ User Interface (React + Vite)"]
        UI_Chat["💬 Chat & Voice Interface"]
        UI_Evidence["🖼️ Evidence Viewer & OCR"]
        UI_Complaint["📋 Complaint Review & Preview"]
        UI_Charts["📊 ML Metrics & Visualizations"]
    end

    subgraph API["⚙️ FastAPI Backend Services"]
        AuthRoute["/api/auth (JWT Security)"]
        ChatRoute["/api/chat (Intake Engine)"]
        EvidenceRoute["/api/evidence (OCR & Media)"]
        ComplaintRoute["/api/complaint (Generator & PDF)"]
        MLRoute["/api/ml (Model Benchmarks)"]
    end

    subgraph ML["🧠 AI & Machine Learning Pipeline"]
        Classifier["TF-IDF Crime Classifier<br/>(SVM, Naive Bayes, Random Forest, LogReg)"]
        NER["Custom Indian Cybercrime NER<br/>(UPI IDs, Txn IDs, Bank Names, Phone Nos)"]
        OCR["OCR & Document Engine<br/>(Tesseract OCR + PyMuPDF)"]
        RiskEngine["Multi-Factor Risk Scorer<br/>(Financial Loss + Urgency + Crime Type)"]
        Gemini["Google Gemini Conversational AI<br/>(Intelligent Dialogue & Formal Description)"]
    end

    subgraph Storage["🗄️ Database & Storage Layer"]
        Postgres[("🐘 PostgreSQL (Users, Complaints, Timeline)")]
        Uploads["📂 Sandboxed Media Storage (Evidence Screenshots & PDFs)"]
    end

    UI_Chat --> ChatRoute
    UI_Evidence --> EvidenceRoute
    UI_Complaint --> ComplaintRoute
    UI_Charts --> MLRoute

    ChatRoute --> Gemini
    ChatRoute --> Classifier
    ChatRoute --> NER
    ChatRoute --> RiskEngine

    EvidenceRoute --> OCR
    OCR --> NER
    EvidenceRoute --> Uploads

    ComplaintRoute --> Postgres
    ComplaintRoute --> PDFGen["📄 ReportLab PDF Generator<br/>(Embedded Visual Screenshot Exhibits)"]
    
    AuthRoute --> Postgres
    ChatRoute --> Postgres
    EvidenceRoute --> Postgres
```

---

## 📋 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker Desktop (for PostgreSQL)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))
- Tesseract OCR ([Windows installer](https://github.com/UB-Mannheim/tesseract/wiki))

### 1. Start PostgreSQL
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Train ML models (first time)
python -m ml_training.train_classifier

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser
- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:8000/api/docs
- **pgAdmin:** http://localhost:5050 (admin@cybercrime.local / admin123)

---

## 🤖 ML Models

The system trains and compares 4 classifiers on a labeled cybercrime dataset:

| Model | Vectorizer | Notes |
|-------|-----------|-------|
| Naive Bayes (MultinomialNB) | TF-IDF | Fast baseline |
| Logistic Regression | TF-IDF | Good for text classification |
| Linear SVM | TF-IDF | High accuracy, commonly best |
| Random Forest | TF-IDF | Ensemble, robust |
| DistilBERT | HuggingFace Tokenizer | Available as Colab notebook |

**15 Crime Categories:**
UPI Fraud · Banking Fraud · OTP Scams · Phishing · Job Fraud · Investment Fraud · E-commerce Fraud · Social Media Fraud · Account Compromise · Identity Theft · Impersonation · Cyber Extortion · Malware/Ransomware · Cryptocurrency Fraud · Other

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── api/                 # Route handlers
│   │   ├── core/                # Config, DB, Security
│   │   ├── ml/                  # Classifier, NER, Risk Scorer, OCR
│   │   ├── models/              # SQLAlchemy models
│   │   └── services/            # Gemini, Complaint Gen, Timeline, PDF
│   ├── ml_training/
│   │   ├── dataset/             # Training CSV (100+ labeled examples)
│   │   └── train_classifier.py  # Training script
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # Landing, Auth, Dashboard, Chat, Evidence, Complaint, ML
│   │   ├── components/          # RiskBadge, EntityCard, Timeline, Checklist, Preview
│   │   ├── store/               # Zustand state management
│   │   └── App.jsx              # Router + Sidebar
│   └── index.html
├── docker-compose.yml           # PostgreSQL + pgAdmin
└── README.md
```

---

## 🔒 Security Features

- JWT authentication with bcrypt password hashing
- File upload validation and sandboxing
- Sensitive data masking in logs (phone numbers, account numbers)
- CORS configured for development
- All uploads stored server-side, not in DB

---

## 📞 Emergency Resources

| Resource | Details |
|----------|---------|
| National Cybercrime Helpline | **1930** |
| Official Reporting Portal | [cybercrime.gov.in](https://cybercrime.gov.in) |
| RBI Ombudsman | [bankingombudsman.rbi.org.in](https://bankingombudsman.rbi.org.in) |
| CERT-In | [cert-in.org.in](https://www.cert-in.org.in) |

---

## 📜 Disclaimer

This system is an **AI-assisted decision-support tool** for complaint preparation. It does not replace law enforcement authorities, make legal determinations, or automatically file official complaints. All information submitted to any official portal must be reviewed and confirmed by the user.

---

*CyberSaathi — AI-Powered Cyber Crime Complaint & Assistance System*
