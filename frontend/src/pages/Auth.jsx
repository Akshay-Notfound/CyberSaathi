import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.full_name, form.password, form.phone);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(59,130,246,0.3)',
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>CyberSaathi</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            AI-Powered Cybercrime Complaint Assistant
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '32px' }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '28px',
          }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  background: mode === m ? 'var(--color-blue-primary)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {m === 'login' ? '🔐 Sign In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  placeholder="Enter your full name"
                  value={form.full_name}
                  onChange={update('full_name')}
                  required
                  id="auth-fullname"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={update('email')}
                required
                id="auth-email"
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Phone (optional)</label>
                <input
                  className="form-input"
                  placeholder="+91 XXXXXXXXXX"
                  value={form.phone}
                  onChange={update('phone')}
                  id="auth-phone"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={update('password')}
                required
                id="auth-password"
              />
            </div>

            {error && (
              <div className="alert alert-critical" style={{ padding: '10px 14px', fontSize: '0.85rem' }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="auth-submit-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 18, height: 18 }} /> Processing...</>
              ) : (
                mode === 'login' ? '🔐 Sign In' : '✨ Create Account'
              )}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border)',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
          }}>
            🔒 Your data is encrypted and securely stored
            <br />
            <span style={{ marginTop: '4px', display: 'block' }}>
              For immediate help: <span style={{ color: 'var(--color-blue-light)', fontWeight: 700 }}>Call 1930</span>
            </span>
          </div>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-blue-light)' }}>
            🌐 cybercrime.gov.in
          </a>
          {' · '}
          <span>National Helpline: 1930</span>
        </div>
      </div>
    </div>
  );
}
