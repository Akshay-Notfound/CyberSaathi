import React from 'react';
import EntityCard from './EntityCard';

export default function EntityPanel({ entities }) {
  if (!entities || Object.keys(entities).length === 0) {
    return null;
  }

  return (
    <div style={{
      borderRadius: '8px',
      border: '1px solid rgba(59, 130, 246, 0.15)',
      background: 'rgba(15, 23, 42, 0.5)',
      padding: '12px',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.72rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#64748b',
        marginBottom: '8px',
      }}>
        Extracted Identifiers & Entities
      </div>
      <EntityCard entities={entities} />
    </div>
  );
}
