import React from 'react';
import EvidenceChecklist from './EvidenceChecklist';

export default function ChecklistPanel({ items = [] }) {
  return (
    <div style={{
      borderRadius: '10px',
      border: '1px solid rgba(59, 130, 246, 0.18)',
      background: 'rgba(15, 23, 42, 0.5)',
      padding: '20px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#64748b',
        marginBottom: '12px',
      }}>
        Required Supporting Evidence Checklist
      </div>
      <EvidenceChecklist items={items} />
    </div>
  );
}
