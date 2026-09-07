import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { MessageSquare, FolderOpen, FileText, ArrowLeft, Shield } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function CaseSidebar({ complaint, complaintId }) {
  const cId = complaintId || complaint?.id;

  const NAV_LINKS = [
    { to: `/case/${cId}/chat`, icon: MessageSquare, label: 'Chat & Intake' },
    { to: `/case/${cId}/evidence`, icon: FolderOpen, label: 'Evidence Upload' },
    { to: `/case/${cId}/complaint`, icon: FileText, label: 'Complaint Review' },
  ];

  return (
    <aside style={{
      width: '100%',
      maxWidth: '300px',
      borderRight: '1px solid rgba(59, 130, 246, 0.15)',
      background: 'rgba(10, 22, 40, 0.4)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      {/* Back to Cases */}
      <div>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            color: '#94a3b8',
            textDecoration: 'none',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={14} /> Back to cases
        </Link>

        {/* Case Info Card */}
        <div style={{
          borderRadius: '10px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '14px',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.72rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Case #{cId || '—'}
          </div>
          <div style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#f8fafc',
            marginTop: '4px',
            marginBottom: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {complaint?.title || `Case #${cId}`}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <RiskBadge
              level={complaint?.risk_level || 'MEDIUM'}
              score={complaint?.risk_score}
              size="sm"
            />
            {complaint?.crime_category && (
              <span style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '6px',
                padding: '2px 8px',
                alignSelf: 'flex-start',
              }}>
                {complaint.crime_category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Case Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.7rem',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 8px 8px',
        }}>
          Workspace Steps
        </div>

        {NAV_LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? '#f8fafc' : '#94a3b8',
              background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <Icon size={16} color="var(--color-blue-primary)" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Quick Advice / 1930 */}
      <div style={{
        marginTop: 'auto',
        borderRadius: '8px',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        padding: '12px',
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} /> Immediate Emergency
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
          Call National Cybercrime Helpline <strong style={{ color: '#fbbf24' }}>1930</strong>
        </div>
      </div>
    </aside>
  );
}
