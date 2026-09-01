import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

export default function EvidenceChecklist({ items = [], uploadedFiles = [] }) {
  const [checked, setChecked] = useState({});

  // Auto-check if uploaded file matches a checklist item keyword
  const isAutoChecked = (item) => {
    const itemLower = item.toLowerCase();
    return uploadedFiles.some((f) => {
      const name = (f.filename || '').toLowerCase();
      const docType = (f.document_type || '').toLowerCase();
      return (
        itemLower.includes('screenshot') && (name.includes('.png') || name.includes('.jpg')) ||
        itemLower.includes('pdf') && name.includes('.pdf') ||
        docType && itemLower.includes(docType.replace('_', ' '))
      );
    });
  };

  const toggleItem = (index) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!items || items.length === 0) {
    return (
      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '12px' }}>
        Start describing your incident to get an evidence checklist.
      </div>
    );
  }

  const checkedCount = items.filter((item, i) => checked[i] || isAutoChecked(item)).length;

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {checkedCount} / {items.length} items
        </span>
        <span style={{ fontSize: '0.8rem', color: checkedCount === items.length ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
          {Math.round((checkedCount / items.length) * 100)}% complete
        </span>
      </div>

      <div className="confidence-bar" style={{ marginBottom: '16px' }}>
        <div
          className="confidence-fill"
          style={{
            width: `${Math.round((checkedCount / items.length) * 100)}%`,
            background: checkedCount === items.length
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : undefined,
          }}
        />
      </div>

      <div className="checklist">
        {items.map((item, index) => {
          const isChecked = checked[index] || isAutoChecked(item);
          return (
            <div
              key={index}
              className={`checklist-item ${isChecked ? 'checked' : ''}`}
              onClick={() => toggleItem(index)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div className={`checklist-checkbox ${isChecked ? 'checked' : ''}`}>
                {isChecked && (
                  <svg width="10" height="8" viewBox="0 0 10 8">
                    <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '0.88rem' }}>{item}</span>
              {isAutoChecked(item) && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.7rem',
                  color: 'var(--color-success)',
                  background: 'rgba(34,197,94,0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  flexShrink: 0,
                }}>
                  ✓ Uploaded
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
