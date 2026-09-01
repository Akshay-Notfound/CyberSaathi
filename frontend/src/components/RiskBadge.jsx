import React from 'react';

const RISK_CONFIGS = {
  CRITICAL: { color: 'critical', label: '🔴 CRITICAL', emoji: '🔴' },
  HIGH: { color: 'high', label: '🟠 HIGH', emoji: '🟠' },
  MEDIUM: { color: 'medium', label: '🟡 MEDIUM', emoji: '🟡' },
  LOW: { color: 'low', label: '🟢 LOW', emoji: '🟢' },
};

export default function RiskBadge({ level, score, showScore = false, size = 'normal' }) {
  if (!level) return null;
  const config = RISK_CONFIGS[level] || RISK_CONFIGS.MEDIUM;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span className={`risk-badge risk-badge-${config.color}`}>
        {config.label}
      </span>
      {showScore && score !== undefined && (
        <span style={{
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
          background: 'rgba(255,255,255,0.04)',
          padding: '2px 8px',
          borderRadius: '999px',
          border: '1px solid var(--color-border)',
        }}>
          Score: {score}/100
        </span>
      )}
    </div>
  );
}

export function RiskMeter({ score = 0, level = 'MEDIUM' }) {
  const colorMap = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  };
  const color = colorMap[level] || colorMap.MEDIUM;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="score-ring" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div className="score-ring-text">
        <span style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)', color }}>{score}</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>/ 100</span>
      </div>
    </div>
  );
}
