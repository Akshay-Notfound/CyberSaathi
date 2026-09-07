import React from 'react';

export default function ModelComparisonChart({ metrics = [] }) {
  if (!metrics || metrics.length === 0) {
    return null;
  }

  const METRIC_COLS = [
    { key: 'accuracy', label: 'Accuracy', color: '#3b82f6' },
    { key: 'precision', label: 'Precision', color: '#14b8a6' },
    { key: 'recall', label: 'Recall', color: '#f59e0b' },
    { key: 'f1_score', label: 'F1-Score', color: '#8b5cf6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '12px 0' }}>
      {metrics.map((m) => (
        <div key={m.model_name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#f8fafc',
          }}>
            <span>{m.model_name}</span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#60a5fa' }}>
              {(m.accuracy * 100).toFixed(1)}% Acc
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
          }}>
            {METRIC_COLS.map((col) => {
              const val = m[col.key] || 0;
              const pct = (val * 100).toFixed(1);

              return (
                <div key={col.key} style={{ background: 'rgba(2, 8, 23, 0.6)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.12)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>{col.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', color: col.color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{
                    height: '6px',
                    width: '100%',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: col.color,
                        borderRadius: '999px',
                        transition: 'width 0.8s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
