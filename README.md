# 🛡️ CyberSaathi — AI-Powered Cyber Crime Complaint & Assistance System

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/Tesseract_OCR-5C6BC0?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Tesseract OCR" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
  <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="MIT License" />
</p>

> **Machine Learning + NLP + OCR + Conversational AI** for automated cybercrime complaint analysis, risk prioritization, and structured reporting.

---

### 🧠 Machine Learning Classifiers & Models

<p align="center">
  <img src="https://img.shields.io/badge/Linear_SVM-Top_Performer_(52.4%25)-blue?style=flat-square&logo=scikit-learn" alt="Linear SVM" />
  <img src="https://img.shields.io/badge/Random_Forest-Ensemble_(51.6%25)-green?style=flat-square&logo=scikit-learn" alt="Random Forest" />
  <img src="https://img.shields.io/badge/Logistic_Regression-Linear_Prob_(50.8%25)-orange?style=flat-square&logo=scikit-learn" alt="Logistic Regression" />
  <img src="https://img.shields.io/badge/Multinomial_Naive_Bayes-Baseline_(47.6%25)-purple?style=flat-square&logo=scikit-learn" alt="Naive Bayes" />
  <img src="https://img.shields.io/badge/TF--IDF-Sublinear_N--Grams_(1--2)-red?style=flat-square" alt="TF-IDF" />
  <img src="https://img.shields.io/badge/Tesseract-OCR_Engine_v5-informational?style=flat-square" alt="OCR" />
</p>

---

## 📌 Problem Statement

Cybercrime victims often struggle to file complete, structured reports because they don't know what information matters, can't describe technical incidents clearly, have evidence scattered across screenshots and messages, and don't know which authority to contact.

**CyberSaathi** is a conversational assistant that turns an unstructured victim account — plus any screenshots, PDFs, or receipts they upload — into a classified, risk-scored, structured complaint draft with an evidence checklist and incident timeline.

> ⚠️ **Disclaimer**: This is an AI-assisted decision-support tool, not a law-enforcement replacement. It never auto-submits anything; every draft is reviewed and confirmed by the user before it goes anywhere.

---

## 🚀 Features & Technologies

| Feature | Technology & Badges |
| :--- | :--- |
| **💬 Conversational Incident Intake** | Rule-based engine, with optional `Google Gemini API` upgrade |
| **🧠 Crime Type Classification (15 categories)** | `TF-IDF` + `Naive Bayes` / `Logistic Regression` / `Linear SVM` / `Random Forest` |
| **🔴 Risk / Urgency Scoring** | Weighted multi-factor scoring model (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) |
| **🔍 Entity Extraction (NER)** | Regex & NLP entity extraction (phones, UPI IDs, amounts, transaction IDs, URLs, dates...) |
| **📸 Evidence OCR Analysis** | `Tesseract OCR` (images) + `PyMuPDF` (PDFs, incl. scanned receipts) |
| **📋 Complaint Generation** | Structured 10-section legal complaint template |
| **⬇️ PDF Report Export** | `ReportLab` PDF generation engine |
| **📊 Model Comparison Dashboard** | `Chart.js` via `react-chartjs-2` |
| **⏱️ Incident Timeline** | Deterministic chronological event reconstruction |
| **✅ Evidence Checklist** | Category-specific, auto-detected upload checklist |
| **🔐 Authentication & Security** | `JWT` + `bcrypt` password hashing |

> The system works fully without any Gemini API key — it falls back to a rule-based conversational engine and a deterministic complaint template. Adding a free Gemini key upgrades the conversation and narrative quality but is never required.

---

## 📁 Project Structure

```text
cybersaathi/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint
│   │   ├── api/                        # auth, chat, complaint, evidence, ml routers
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
*Starts PostgreSQL & pgAdmin at `http://localhost:5050` (`admin@cybercrime.local` / `admin123`).*

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

## 🤖 Machine Learning Model Benchmarks

`ml_training/train_classifier.py` trains and compares four TF-IDF based classifiers on the labeled dataset:

| Model | Accuracy | Precision | Recall | F1-Score | Role & Behavior |
| :--- | :---: | :---: | :---: | :---: | :--- |
| 🥇 **Linear SVM** | **52.4%** | **53.1%** | **52.4%** | **50.5%** | **Best model**; optimal hyperplane separator on sparse TF-IDF vectors |
| 🥈 **Random Forest** | 51.6% | 52.0% | 51.6% | 48.9% | Ensemble classifier; robust to noisy phrasing and typos |
| 🥉 **Logistic Regression** | 50.8% | 51.4% | 50.8% | 47.2% | Calibrated probabilities for confidence scoring |
| 🏅 **Multinomial Naive Bayes**| 47.6% | 44.8% | 47.6% | 42.8% | Fast, lightweight probabilistic baseline |

### 15 Recognized Crime Categories:
*UPI Fraud · Banking Fraud · OTP Scams · Phishing · Job Fraud · Investment Fraud · E-commerce Fraud · Social Media Fraud · Account Compromise · Identity Theft · Impersonation · Cyber Extortion · Malware/Ransomware · Cryptocurrency Fraud · Other*

---

## 🔒 Security & Privacy
- 🔐 **JWT Authentication** with bcrypt password hashing
- 🛡️ **File Upload Validation** (extension allow-list + 15MB size limit) before disk write
- 📦 **Evidence Storage**: Stored server-side under `uploads/`, never inlined into the database
- 🌐 **CORS Protection**: Restricted to configured origins in `.env`
- 🛑 Set a long, random `SECRET_KEY` before deploying to production

---

## 📤 Publishing to GitHub

```bash
git init
git add .
git commit -m "feat: add comprehensive badges and documentation"
git branch -M main
git remote add origin https://github.com/<your-username>/CyberSaathi.git
git push -u origin main
```

---

## 🌐 Deployment Architecture

* **Backend**: [Render](https://render.com), [Railway](https://railway.app), or [Fly.io]. Set environment variables from `.env.example`.
* **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Set `VITE_API_URL` to your deployed backend URL.
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
