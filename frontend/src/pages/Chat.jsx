import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, AlertCircle, Brain, Shield } from 'lucide-react';
import useStore, { API_BASE } from '../store/useStore';
import RiskBadge, { RiskMeter } from '../components/RiskBadge';
import EntityCard from '../components/EntityCard';
import EvidenceChecklist from '../components/EvidenceChecklist';
import ComplaintPreview from '../components/ComplaintPreview';
import { useNavigate } from 'react-router-dom';

const TABS = [
  { key: 'entities', label: '🔍 Entities', icon: Brain },
  { key: 'checklist', label: '✅ Evidence', icon: FileText },
  { key: 'complaint', label: '📋 Complaint', icon: Shield },
];

export default function Chat() {
  const {
    chatMessages, sendMessage, startComplaint, activeComplaintId,
    extractedEntities, classification, risk, missingInfo, evidenceChecklist,
    evidenceFiles, uploadEvidence, generateComplaint,
  } = useStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [rightTab, setRightTab] = useState('entities');
  const [complaintData, setComplaintData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeComplaintId) {
      startComplaint();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, sending]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setInput('');
    setSending(true);
    try {
      await sendMessage(msg);
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      await uploadEvidence(file);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await generateComplaint();
      setComplaintData(data);
      setRightTab('complaint');
    } catch (err) {
      console.error('Generate failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (activeComplaintId) {
      try {
        const token = useStore.getState().token;
        const response = await fetch(`${API_BASE}/api/complaint/${activeComplaintId}/pdf`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to download PDF');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CyberSaathi_Complaint_${activeComplaintId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error('PDF Download failed:', err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 0px)', overflow: 'hidden' }}>
      {/* ─── Left: Chat Panel ───────────────────────────────── */}
      <div style={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderRight: '1px solid var(--color-border)',
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-border)',
          background: 'rgba(10,22,40,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>CyberSaathi</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                AI Complaint Assistant
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {risk && <RiskBadge level={risk.level} />}
            {activeComplaintId && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                #{activeComplaintId}
              </span>
            )}
          </div>
        </div>

        {/* Classification Banner */}
        {classification?.category && (
          <div style={{
            padding: '8px 24px',
            background: 'rgba(59,130,246,0.06)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>AI Detected:</span>
            <span style={{
              fontSize: '0.82rem',
              background: 'rgba(59,130,246,0.15)',
              color: 'var(--color-blue-light)',
              padding: '3px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(59,130,246,0.25)',
              fontWeight: 600,
            }}>
              {classification.category}
            </span>
            {classification.confidence && (
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                {Math.round(classification.confidence * 100)}% confident
              </span>
            )}
          </div>
        )}

        {/* Missing Info Alert */}
        {missingInfo && missingInfo.length > 0 && (
          <div style={{
            padding: '8px 24px',
            background: 'rgba(234,179,8,0.06)',
            borderBottom: '1px solid rgba(234,179,8,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}>
            <AlertCircle size={14} color="#eab308" />
            <span style={{ fontSize: '0.78rem', color: '#eab308' }}>
              Still needed: {missingInfo.join(' · ')}
            </span>
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
          {chatMessages.map((msg, i) => (
            <MessageBubble key={msg.id || i} message={msg} />
          ))}
          {sending && (
            <div className="message-bubble assistant">
              <div className="message-header">
                <div className="message-avatar assistant-avatar">🛡️</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>CyberSaathi</span>
              </div>
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Evidence Files Indicator */}
        {evidenceFiles.length > 0 && (
          <div style={{
            padding: '6px 24px',
            background: 'rgba(34,197,94,0.06)',
            borderTop: '1px solid rgba(34,197,94,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-success)' }}>
              📎 {evidenceFiles.length} file{evidenceFiles.length > 1 ? 's' : ''} uploaded and analyzed
            </span>
          </div>
        )}

        {/* Input Area */}
        <div className="chat-input-area" style={{ flexShrink: 0 }}>
          <div className="chat-input-wrapper">
            {/* File upload */}
            <button
              className="btn btn-icon btn-ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile || !activeComplaintId}
              title="Upload screenshot or document"
              style={{ flexShrink: 0 }}
            >
              {uploadingFile ? (
                <div className="spinner" style={{ width: 16, height: 16 }} />
              ) : (
                <Upload size={18} color="var(--color-text-muted)" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              id="chat-file-input"
            />

            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Describe what happened... (Press Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              id="chat-message-input"
              style={{ maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />

            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              id="chat-send-btn"
            >
              <Send size={16} />
            </button>
          </div>

          {/* Bottom actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              🔒 Secure · All data encrypted
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleGenerate}
                disabled={generating || chatMessages.length < 3}
                id="generate-complaint-btn"
              >
                {generating ? (
                  <><div className="spinner" style={{ width: 14, height: 14 }} /> Generating...</>
                ) : '📋 Generate Complaint'}
              </button>
              {complaintData && (
                <button className="btn btn-primary btn-sm" onClick={handleDownloadPdf} id="download-pdf-btn">
                  ⬇️ Download PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right: Analysis Panel ──────────────────────────── */}
      <div style={{
        width: '380px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,22,40,0.5)',
        overflowY: 'auto',
      }}>
        {/* Risk Meter */}
        {risk && (
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}>
            <RiskMeter score={risk.score} level={risk.level} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                Risk Assessment
              </div>
              <RiskBadge level={risk.level} showScore score={risk.score} />
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
                {risk.explanation}
              </div>
            </div>
          </div>
        )}

        {/* Tab Bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRightTab(tab.key)}
              style={{
                flex: 1,
                padding: '12px 4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: rightTab === tab.key ? 'var(--color-blue-light)' : 'var(--color-text-muted)',
                borderBottom: rightTab === tab.key ? '2px solid var(--color-blue-primary)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {rightTab === 'entities' && (
            <div>
              {classification?.category && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '10px',
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Crime Classification
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem', marginBottom: '8px' }}>
                    {classification.category}
                  </div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${Math.round((classification.confidence || 0) * 100)}%` }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', textAlign: 'right' }}>
                    {Math.round((classification.confidence || 0) * 100)}% confidence
                  </div>

                  {classification.indicators?.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Key Indicators:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {classification.indicators.slice(0, 6).map((ind, i) => (
                          <span key={i} style={{
                            fontSize: '0.72rem',
                            background: 'rgba(59,130,246,0.12)',
                            color: 'var(--color-blue-light)',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            border: '1px solid rgba(59,130,246,0.2)',
                          }}>
                            ✓ {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <EntityCard entities={extractedEntities} />
            </div>
          )}

          {rightTab === 'checklist' && (
            <div>
              {evidenceFiles.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    Uploaded Files ({evidenceFiles.length})
                  </div>
                  {evidenceFiles.map((ef, i) => {
                    const isImg = ef.file_type === 'image' || (ef.filename && ef.filename.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/i));
                    const fileId = ef.evidence_id || ef.id;
                    return (
                      <div key={fileId || i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        background: 'rgba(34,197,94,0.06)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontSize: '0.82rem',
                      }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '4px',
                          background: 'rgba(0,0,0,0.3)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {isImg && fileId ? (
                            <img
                              src={`${API_BASE}/api/evidence/preview/${fileId}`}
                              alt={ef.filename}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span style={{ display: isImg && fileId ? 'none' : 'flex', fontSize: '1rem' }}>
                            {ef.file_type === 'pdf' ? '📄' : '🖼️'}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="truncate" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{ef.filename}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                            {(ef.document_type || 'evidence').replace('_', ' ')}
                          </div>
                        </div>
                        <span style={{ color: 'var(--color-success)', fontSize: '0.7rem', flexShrink: 0, background: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          ✓ Attached
                        </span>
                      </div>
                    );
                  })}
                  <div className="divider" />
                </div>
              )}
              <EvidenceChecklist items={evidenceChecklist} uploadedFiles={evidenceFiles} />
            </div>
          )}

          {rightTab === 'complaint' && (
            <ComplaintPreview
              complaintText={complaintData?.complaint_text}
              complaint={complaintData}
            />
          )}
        </div>

        {/* Immediate Actions (if CRITICAL) */}
        {risk?.level === 'CRITICAL' && risk.immediate_actions && (
          <div style={{
            padding: '16px',
            borderTop: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.05)',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
              ⚠️ Immediate Actions Required
            </div>
            {risk.immediate_actions.slice(0, 3).map((action, i) => (
              <div key={i} style={{
                fontSize: '0.78rem',
                color: '#fca5a5',
                marginBottom: '4px',
                display: 'flex',
                gap: '6px',
              }}>
                {action}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-header">
        <div className={`message-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
          {isUser ? '👤' : '🛡️'}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {isUser ? 'You' : 'CyberSaathi'}
        </span>
      </div>
      <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
        {message.content}
      </div>
    </div>
  );
}
