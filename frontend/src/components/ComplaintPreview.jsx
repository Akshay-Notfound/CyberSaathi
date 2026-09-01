import React, { useState } from 'react';
import { API_BASE } from '../store/useStore';

const SECTIONS = [
  { key: 'complainant', label: '👤 Complainant Details' },
  { key: 'classification', label: '🔍 Incident Classification' },
  { key: 'description', label: '📝 Incident Description' },
  { key: 'financial', label: '💰 Financial Details' },
  { key: 'suspect', label: '🕵️ Suspect Information' },
  { key: 'evidence', label: '📁 Digital Evidence' },
  { key: 'timeline', label: '📅 Incident Timeline' },
  { key: 'actions', label: '⚖️ Requested Action' },
  { key: 'declaration', label: '📋 Declaration' },
];

export default function ComplaintPreview({ complaintText, complaint }) {
  const [expanded, setExpanded] = useState({ description: true, classification: true });
  const [copyState, setCopyState] = useState(false);

  const toggleSection = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(complaintText || '').then(() => {
      setCopyState(true);
      setTimeout(() => setCopyState(false), 2000);
    });
  };

  if (!complaintText && !complaint) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        color: 'var(--color-text-muted)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
          Complaint not generated yet
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          Complete the chat and click "Generate Complaint" to see your complaint here.
        </div>
      </div>
    );
  }

  // Show quick summary cards if we have complaint data
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Copy Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
        <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
          {copyState ? '✓ Copied!' : '📋 Copy Full Complaint'}
        </button>
      </div>

      {complaint && (
        <>
          {/* Quick Summary */}
          {complaint.crime_category && (
            <SummaryRow
              label="Crime Category"
              value={complaint.crime_category}
              badge={true}
            />
          )}
          {complaint.risk_level && (
            <SummaryRow
              label="Risk Level"
              value={complaint.risk_level}
              color={getRiskColor(complaint.risk_level)}
            />
          )}
          {complaint.financial_loss && (
            <SummaryRow
              label="Financial Loss"
              value={`₹${Number(complaint.financial_loss).toLocaleString('en-IN')}`}
            />
          )}
          {complaint.incident_description && (
            <AccordionSection
              title="📝 Incident Description"
              isOpen={expanded.description}
              onToggle={() => toggleSection('description')}
            >
              <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--color-text-primary)' }}>
                {complaint.incident_description}
              </p>
            </AccordionSection>
          )}

          {/* Attached Digital Evidence Preview */}
          {complaint.evidence_files?.length > 0 && (
            <AccordionSection
              title={`📁 Digital Evidence (${complaint.evidence_files.length} file${complaint.evidence_files.length > 1 ? 's' : ''} attached)`}
              isOpen={expanded.evidence !== false}
              onToggle={() => toggleSection('evidence')}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {complaint.evidence_files.map((ef, i) => {
                  const isImg = ef.file_type === 'image' || (ef.filename && ef.filename.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/i));
                  return (
                    <div
                      key={ef.id || i}
                      onClick={() => onSelectEvidence && onSelectEvidence(ef)}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--color-blue-light)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                      }}
                    >
                      <div style={{ height: '110px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {isImg ? (
                          <img
                            src={`${API_BASE}/api/evidence/preview/${ef.id}`}
                            alt={ef.filename}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span style={{ display: isImg ? 'none' : 'flex', fontSize: '2rem' }}>
                          {ef.file_type === 'pdf' ? '📄' : '📝'}
                        </span>
                      </div>
                      <div style={{ padding: '8px 10px' }}>
                        <div className="truncate" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {ef.filename}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                          {(ef.document_type || 'evidence').replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionSection>
          )}
        </>
      )}

      {/* Full Complaint Text */}
      {complaintText && (
        <AccordionSection
          title="📄 Full Complaint Text"
          isOpen={expanded.full}
          onToggle={() => toggleSection('full')}
        >
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--color-text-secondary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.6',
            background: 'rgba(0,0,0,0.3)',
            padding: '16px',
            borderRadius: '8px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}>
            {complaintText}
          </pre>
        </AccordionSection>
      )}
    </div>
  );
}

function SummaryRow({ label, value, badge, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      background: 'rgba(59,130,246,0.04)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
    }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color: color || 'var(--color-text-primary)',
        background: color ? `${color}15` : 'transparent',
        padding: color ? '2px 10px' : '0',
        borderRadius: '999px',
        border: color ? `1px solid ${color}30` : 'none',
      }}>
        {value}
      </span>
    </div>
  );
}

function AccordionSection({ title, isOpen, onToggle, children }) {
  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(59,130,246,0.04)',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
          fontSize: '0.9rem',
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          transition: 'background 0.15s',
        }}
      >
        <span>{title}</span>
        <span style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
          fontSize: '0.7rem',
          opacity: 0.6,
        }}>▼</span>
      </button>
      {isOpen && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function getRiskColor(level) {
  const map = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' };
  return map[level] || '#64748b';
}
