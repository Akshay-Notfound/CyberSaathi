import React from 'react';

const ENTITY_LABELS = {
  phone_numbers: { label: '📞 Phone Numbers', color: '#60a5fa' },
  upi_ids: { label: '💳 UPI IDs', color: '#a78bfa' },
  amounts: { label: '💰 Amounts', color: '#34d399' },
  transaction_ids: { label: '🔖 Transaction IDs', color: '#f9a8d4' },
  urls: { label: '🔗 URLs', color: '#fb923c' },
  emails: { label: '📧 Emails', color: '#38bdf8' },
  account_numbers: { label: '🏦 Account Numbers', color: '#fbbf24' },
  ifsc_codes: { label: '🔢 IFSC Codes', color: '#4ade80' },
  dates: { label: '📅 Dates', color: '#c084fc' },
  times: { label: '⏰ Times', color: '#e879f9' },
  banks: { label: '🏛️ Banks', color: '#67e8f9' },
  payment_apps: { label: '📱 Payment Apps', color: '#a3e635' },
  pan_numbers: { label: '🪪 PAN Numbers', color: '#f87171' },
};

export default function EntityCard({ entities }) {
  if (!entities || Object.keys(entities).length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--color-text-muted)',
        fontSize: '0.85rem',
      }}>
        No entities extracted yet. Start describing the incident.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Object.entries(ENTITY_LABELS).map(([key, config]) => {
        const values = entities[key];
        if (!values || values.length === 0) return null;

        return (
          <div
            key={key}
            className="entity-card"
            style={{ borderColor: `${config.color}22` }}
          >
            <div className="entity-label" style={{ color: config.color }}>
              {config.label}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {values.map((val, i) => (
                <CopyChip key={i} value={val} color={config.color} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CopyChip({ value, color }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title="Click to copy"
      style={{
        background: `${color}12`,
        border: `1px solid ${color}30`,
        borderRadius: '6px',
        padding: '3px 10px',
        color: copied ? '#22c55e' : 'var(--color-text-primary)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.82rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
      }}
    >
      {copied ? '✓ Copied' : value}
    </button>
  );
}
