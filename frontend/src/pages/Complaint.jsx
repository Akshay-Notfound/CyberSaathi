import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore, { api } from '../store/useStore';
import RiskBadge from '../components/RiskBadge';
import ComplaintPreview from '../components/ComplaintPreview';
import Timeline from '../components/Timeline';
import EntityCard from '../components/EntityCard';

export default function Complaint() {
  const { activeComplaintId, generateComplaint } = useStore();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [tab, setTab] = useState('preview');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeComplaintId) {
      loadComplaint();
    }
  }, [activeComplaintId]);

  const loadComplaint = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/complaint/${activeComplaintId}`);
      setComplaint(res.data);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await generateComplaint();
      setComplaint(data);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (activeComplaintId) {
      const token = useStore.getState().token;
      const w = window.open(`http://localhost:8000/api/complaint/${activeComplaintId}/pdf`, '_blank');
    }
  };

  if (!activeComplaintId) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
          <h2>No Active Complaint</h2>
          <p style={{ marginBottom: '24px' }}>Start a new complaint from the Chat page.</p>
          <button className="btn btn-primary" onClick={() => navigate('/chat')}>
            → Go to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <div className="section-title">📋 Complaint Review</div>
          <div className="section-subtitle">
            Review, edit and download your structured cybercrime complaint
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={handleGenerate}
            disabled={generating}
            id="regenerate-complaint-btn"
          >
            {generating ? (
              <><div className="spinner" style={{ width: 16, height: 16 }} /> Generating...</>
            ) : '🔄 Regenerate'}
          </button>
          {(complaint?.complaint_text || complaint?.status === 'COMPLETE') && (
            <button className="btn btn-primary" onClick={handleDownloadPdf} id="download-pdf-btn">
              ⬇️ Download PDF
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div className="spinner" />
        </div>
      ) : complaint ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {/* Left: Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Summary Banner */}
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Crime Category</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{complaint.crime_category || '—'}</div>
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Risk Level</div>
                  <RiskBadge level={complaint.risk_level} showScore score={Math.round((complaint.risk_score || 0))} />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Financial Loss</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: complaint.financial_loss ? '#ef4444' : 'var(--color-text-secondary)' }}>
                    {complaint.financial_loss ? `₹${Number(complaint.financial_loss).toLocaleString('en-IN')}` : '—'}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Status</div>
                  <span className={`status-badge status-${(complaint.status || 'draft').toLowerCase().replace('_', '-')}`}>
                    {complaint.status || 'DRAFT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--color-border)', paddingBottom: '0' }}>
              {[
                { key: 'preview', label: '📋 Complaint Preview' },
                { key: 'timeline', label: '📅 Timeline' },
                { key: 'entities', label: '🔍 Entities' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: tab === t.key ? 'var(--color-blue-light)' : 'var(--color-text-muted)',
                    borderBottom: tab === t.key ? '2px solid var(--color-blue-primary)' : '2px solid transparent',
                    marginBottom: '-1px',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              {tab === 'preview' && (
                <ComplaintPreview
                  complaintText={complaint.complaint_text}
                  complaint={{
                    crime_category: complaint.crime_category,
                    risk_level: complaint.risk_level,
                    financial_loss: complaint.financial_loss,
                    incident_description: complaint.incident_description,
                    evidence_files: complaint.evidence_files,
                  }}
                  onSelectEvidence={setSelectedEvidence}
                />
              )}
              {tab === 'timeline' && <Timeline events={complaint.timeline || []} />}
              {tab === 'entities' && <EntityCard entities={complaint.extracted_entities || {}} />}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Indicators */}
            {complaint.crime_indicators?.length > 0 && (
              <div className="glass-card" style={{ padding: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                  🎯 Fraud Indicators Detected
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {complaint.crime_indicators.map((ind, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--color-success)', fontSize: '0.7rem' }}>✓</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence Files */}
            {complaint.evidence_files?.length > 0 && (
              <div className="glass-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    📂 Attached Evidence ({complaint.evidence_files.length})
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-blue-light)', fontWeight: 600 }}>
                    Embedded in PDF
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {complaint.evidence_files.map((ef, i) => {
                    const isImg = ef.file_type === 'image' || (ef.filename && ef.filename.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/i));
                    return (
                      <div
                        key={ef.id || i}
                        onClick={() => setSelectedEvidence(ef)}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '10px',
                          background: 'rgba(59,130,246,0.04)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '10px',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-blue-primary)';
                          e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.background = 'rgba(59,130,246,0.04)';
                        }}
                      >
                        {/* Visual Thumbnail */}
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}>
                          {isImg ? (
                            <img
                              src={`http://localhost:8000/api/evidence/preview/${ef.id}`}
                              alt={ef.filename}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span style={{ display: isImg ? 'none' : 'flex', fontSize: '1.2rem' }}>
                            {ef.file_type === 'pdf' ? '📄' : '📝'}
                          </span>
                        </div>

                        {/* File Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="truncate" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                            {ef.filename}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', gap: '6px' }}>
                            <span style={{ textTransform: 'capitalize', color: 'var(--color-blue-light)' }}>
                              {(ef.document_type || 'evidence').replace('_', ' ')}
                            </span>
                            {ef.file_size_kb > 0 && <span>· {ef.file_size_kb} KB</span>}
                          </div>
                        </div>

                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvidence(ef);
                          }}
                        >
                          👁️ View
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Missing Info */}
            {complaint.missing_info?.length > 0 && (
              <div className="glass-card" style={{ padding: '16px', border: '1px solid rgba(234,179,8,0.25)', background: 'rgba(234,179,8,0.04)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', color: '#eab308' }}>
                  ⚠️ Missing Information
                </div>
                {complaint.missing_info.map((item, i) => (
                  <div key={i} style={{ fontSize: '0.82rem', color: '#fef08a', marginBottom: '4px' }}>
                    · {item}
                  </div>
                ))}
              </div>
            )}

            {/* Submission Guide */}
            <div className="glass-card" style={{ padding: '16px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                🌐 How to Submit Officially
              </div>
              {[
                { step: '1', text: 'Download the PDF complaint above' },
                { step: '2', text: 'Visit cybercrime.gov.in' },
                { step: '3', text: 'Register/login on the portal' },
                { step: '4', text: 'Upload this complaint + evidence' },
                { step: '5', text: 'Note your complaint reference number' },
              ].map((item) => (
                <div key={item.step} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <span style={{ width: 20, height: 20, background: 'rgba(59,130,246,0.2)', color: 'var(--color-blue-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{item.step}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>{item.text}</span>
                </div>
              ))}
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ display: 'block', textAlign: 'center', marginTop: '12px', textDecoration: 'none' }}
              >
                🌐 Open cybercrime.gov.in
              </a>
              <div style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                Or call <strong style={{ color: 'var(--color-blue-light)' }}>1930</strong> for immediate help
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <p style={{ marginBottom: '24px' }}>No complaint data yet. Generate the complaint first.</p>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : '✨ Generate Complaint'}
          </button>
        </div>
      )}

      {/* Evidence Preview Modal */}
      {selectedEvidence && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }} onClick={() => setSelectedEvidence(null)}>
          <div
            className="glass-card"
            style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '24px', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
                  {selectedEvidence.filename}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px', textTransform: 'capitalize' }}>
                  {(selectedEvidence.document_type || 'evidence').replace('_', ' ')} {selectedEvidence.file_size_kb ? `· ${selectedEvidence.file_size_kb} KB` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`http://localhost:8000/api/evidence/file/${selectedEvidence.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  🔗 Open Raw File
                </a>
                <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setSelectedEvidence(null)}>✕</button>
              </div>
            </div>

            {/* Attached Screenshot / Image / PDF Preview */}
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '250px',
              maxHeight: '480px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              {selectedEvidence.file_type === 'image' || (selectedEvidence.filename && selectedEvidence.filename.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/i)) ? (
                <img
                  src={`http://localhost:8000/api/evidence/file/${selectedEvidence.id}`}
                  alt={selectedEvidence.filename}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '440px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : selectedEvidence.file_type === 'pdf' || (selectedEvidence.filename && selectedEvidence.filename.match(/\.pdf$/i)) ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={`http://localhost:8000/api/evidence/preview/${selectedEvidence.id}`}
                    alt="PDF Page Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '380px',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <a
                    href={`http://localhost:8000/api/evidence/file/${selectedEvidence.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    📄 View Full PDF
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📝</div>
                  <div>Document File Attachment</div>
                </div>
              )}
              <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🖼️</div>
                <div>Attached Screenshot</div>
              </div>
            </div>

            {selectedEvidence.ocr_preview && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  📖 OCR Text Summary
                </div>
                <pre style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {selectedEvidence.ocr_preview}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
