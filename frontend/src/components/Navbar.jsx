import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      background: 'rgba(2, 8, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
      zIndex: 50,
      padding: '0 32px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
        }}>
          🛡️
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>
            CyberSaathi
          </span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', lineHeight: 1 }}>
            AI Complaint System
          </span>
        </div>
      </Link>

      {/* Center / Helpline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '999px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          fontSize: '0.8rem',
          color: '#f87171',
          fontWeight: 600,
        }}>
          <span>📞 Helpline: 1930</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/auth')}
          style={{ fontSize: '0.85rem', padding: '6px 16px' }}
        >
          Sign In
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/auth')}
          style={{ fontSize: '0.85rem', padding: '6px 18px' }}
        >
          Get Started →
        </button>
      </div>
    </nav>
  );
}
