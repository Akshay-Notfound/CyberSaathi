import React from 'react';

export default function Timeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '12px', textAlign: 'center' }}>
        Timeline will appear after you describe the incident with dates and times.
      </div>
    );
  }

  return (
    <div className="timeline">
      {events.map((event, index) => (
        <div
          className="timeline-item"
          key={index}
          style={{ animationDelay: `${index * 0.08}s` }}
        >
          <div className="timeline-dot" title={event.event_type || 'event'}>
            {event.icon || '📌'}
          </div>
          <div className="timeline-content">
            <div className="timeline-time">{event.datetime || 'Time unknown'}</div>
            <div className="timeline-desc">{event.description}</div>
            {event.source && (
              <div className="timeline-source">Source: {event.source}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
