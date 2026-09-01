import React from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '🧠', title: 'AI Crime Classification', desc: 'ML models (Naive Bayes, SVM, BERT) automatically identify the type of cybercrime from your description with confidence scores.' },
  { icon: '🔴', title: 'Risk/Urgency Scoring', desc: 'Weighted scoring engine classifies incidents as CRITICAL, HIGH, MEDIUM, or LOW and provides immediate action guidance.' },
  { icon: '🔍', title: 'NLP Entity Extraction', desc: 'Extracts phone numbers, UPI IDs, amounts, transaction IDs, dates, URLs and more from your conversation automatically.' },
  { icon: '📸', title: 'OCR Evidence Analysis', desc: 'Upload screenshots and PDFs. Tesseract OCR extracts text and entities from bank statements, chat screenshots, and offer letters.' },
  { icon: '📋', title: 'Complaint Generation', desc: 'Generates a structured, 10-section cybercrime complaint with timeline, entity list, and evidence summary — ready to submit.' },
  { icon: '📊', title: 'Model Comparison', desc: 'Academic dashboard comparing ML model performance across 15 cybercrime categories with accuracy, precision, recall, and F1 metrics.' },
];

const CRIME_TYPES = [
  'UPI / Payment Fraud', 'Banking Fraud', 'OTP Scams', 'Phishing',
  'Job Fraud', 'Investment Fraud', 'E-commerce Fraud', 'Impersonation',
  'Account Compromise', 'Identity Theft', 'Cyber Extortion', 'Ransomware',
  'Cryptocurrency Fraud', 'Social Media Fraud',
];

const STATS = [
  { value: '15+', label: 'Crime Categories' },
  { value: '4', label: 'ML Models Compared' },
  { value: '10', label: 'Complaint Sections' },
  { value: '1930', label: 'Helpline Number' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: 'rgba(2,8,23,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(59,130,246,0.15)',
        zIndex: 100,
        padding: '0 48px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>🛡️</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>CyberSaathi</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/auth')} id="nav-signin-btn">Sign In</button>
          <button className="btn btn-primary" onClick={() => navigate('/auth')} id="nav-getstarted-btn">Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              borderRadius: '50%',
              filter: 'blur(80px)',
              opacity: 0.12,
              background: ['#3b82f6', '#6366f1', '#8b5cf6'][i],
              width: ['600px', '400px', '500px'][i],
              height: ['600px', '400px', '500px'][i],
              top: ['10%', '50%', '70%'][i],
              left: ['5%', '60%', '20%'][i],
              animation: `float-orb ${8 + i * 3}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>

        <style>{`
          @keyframes float-orb {
            from { transform: translate(0, 0) scale(1); }
            to { transform: translate(30px, 20px) scale(1.05); }
          }
          @keyframes hero-appear {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div style={{ maxWidth: '800px', position: 'relative', animation: 'hero-appear 0.8s ease' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '999px',
            padding: '6px 16px',
            fontSize: '0.82rem',
            color: 'var(--color-blue-light)',
            marginBottom: '24px',
            fontWeight: 600,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse-critical 2s infinite' }} />
            Final Year Project · ML + NLP + OCR
          </div>

          <h1 style={{ marginBottom: '20px', lineHeight: 1.15 }}>
            AI-Powered{' '}
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Cyber Crime
            </span>
            {' '}Complaint System
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Transform unstructured cybercrime victim reports into structured, categorized, risk-prioritized complaints using Machine Learning, NLP, OCR, and conversational AI.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/auth')}
              id="hero-start-btn"
            >
              🛡️ Start Your Complaint
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/auth')}
              id="hero-demo-btn"
            >
              📊 View ML Benchmarks
            </button>
          </div>

          {/* Urgency Note */}
          <div style={{
            marginTop: '32px',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            <span>🚨</span>
            <span>For immediate help, call the National Cybercrime Helpline:</span>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-critical)', letterSpacing: '0.05em' }}>1930</span>
            <span>·</span>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue-light)' }}>cybercrime.gov.in</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px 48px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '32px', textAlign: 'center' }}>
          {STATS.map((stat) => (
            <div key={stat.value}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-blue-primary)', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2>Everything You Need to Report Cybercrime</h2>
          <p style={{ marginTop: '12px', maxWidth: '500px', margin: '12px auto 0' }}>
            Powered by ML, NLP, and OCR — handling 15+ cybercrime categories
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Crime Categories */}
      <section style={{ padding: '60px 48px', background: 'rgba(59,130,246,0.03)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>15+ Cybercrime Categories</h2>
          <p style={{ marginBottom: '32px' }}>The ML classifier can identify these types of cybercrime</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {CRIME_TYPES.map((cat) => (
              <span key={cat} style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                color: 'var(--color-blue-light)',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}>{cat}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section style={{ padding: '80px 48px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '40px' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {[
            { icon: '💬', step: '1', title: 'Describe Incident', desc: 'Chat with CyberSaathi in plain language' },
            { icon: '📎', step: '2', title: 'Upload Evidence', desc: 'Add screenshots, PDFs, documents' },
            { icon: '🧠', step: '3', title: 'AI Analysis', desc: 'ML classifies, extracts, scores risk' },
            { icon: '📋', step: '4', title: 'Review Complaint', desc: 'Check structured complaint + timeline' },
            { icon: '⬇️', step: '5', title: 'Download PDF', desc: 'Professional complaint document' },
            { icon: '🌐', step: '6', title: 'Submit Officially', desc: 'Upload to cybercrime.gov.in' },
          ].map((step) => (
            <div key={step.step} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48,
                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '1.3rem',
              }}>
                {step.icon}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Step {step.step}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{step.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 48px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, rgba(59,130,246,0.06))',
        borderTop: '1px solid var(--color-border)',
      }}>
        <h2 style={{ marginBottom: '16px' }}>Ready to Report a Cybercrime?</h2>
        <p style={{ marginBottom: '32px' }}>AI-assisted complaint generation — free, secure, and private</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth')} id="cta-getstarted-btn">
          🛡️ Get Started — It's Free
        </button>
        <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Emergency? Call <strong style={{ color: 'var(--color-critical)' }}>1930</strong> immediately
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 48px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🛡️</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>CyberSaathi</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>AI-Powered Cybercrime Complaint System · Final Year Project</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue-light)' }}>cybercrime.gov.in</a>
          <span>Helpline: 1930</span>
          <span>Built with FastAPI + React + Gemini AI</span>
        </div>
      </footer>
    </div>
  );
}
