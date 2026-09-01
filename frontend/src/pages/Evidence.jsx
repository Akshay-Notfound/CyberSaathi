import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import useStore, { API_BASE } from '../store/useStore';

const ACCEPTED_TYPES = {
  'image/jpeg': { icon: '🖼️', label: 'JPEG Image' },
  'image/png': { icon: '🖼️', label: 'PNG Image' },
  'image/webp': { icon: '🖼️', label: 'WebP Image' },
  'application/pdf': { icon: '📄', label: 'PDF Document' },
  'text/plain': { icon: '📝', label: 'Text File' },
};

export default function Evidence() {
  const { uploadEvidence, evidenceFiles, activeComplaintId } = useStore();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!activeComplaintId) {
      setError('Please start a complaint session from the Chat page first.');
      return;
    }
    setError('');

    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES[file.type] && !file.name.match(/\.(png|jpg|jpeg|webp|pdf|txt)$/i)) {
        setError(`File type not supported: ${file.name}`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`File too large (max 10MB): ${file.name}`);
        continue;
      }

      setUploading(true);
      try {
        const result = await uploadEvidence(file);
        setUploadResults((prev) => [...prev, { ...result, name: file.name }]);
      } catch (err) {
        setError(err.response?.data?.detail || `Failed to upload: ${file.name}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div>
          <div className="section-title">📁 Evidence Upload & Analysis</div>
          <div className="section-subtitle">
            Upload screenshots, PDFs, and documents for AI-powered OCR analysis
          </div>
        </div>
      </div>

      {!activeComplaintId && (
        <div className="alert alert-info" style={{ marginBottom: '24px' }}>
          <span>ℹ️</span>
          <span>No active complaint session. Go to the <strong>Chat</strong> page to start a new complaint first, then come back to upload evidence.</span>
        </div>
      )}

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{ marginBottom: '24px', cursor: activeComplaintId ? 'pointer' : 'not-allowed', opacity: activeComplaintId ? 1 : 0.5 }}
        id="evidence-upload-zone"
      >
        <div className="upload-icon">
          {uploading ? '⏳' : dragOver ? '📂' : '☁️'}
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          {uploading ? 'Analyzing with OCR...' : 'Drop files here or click to upload'}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Supports: PNG, JPG, WebP, PDF, TXT (max 10MB each)
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(ACCEPTED_TYPES).map(([type, { icon, label }]) => (
            <span key={type} style={{
              fontSize: '0.75rem',
              background: 'rgba(59,130,246,0.08)',
              color: 'var(--color-text-muted)',
              padding: '4px 10px',
              borderRadius: '999px',
              border: '1px solid var(--color-border)',
            }}>
              {icon} {label}
            </span>
          ))}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
          id="evidence-file-input"
        />
      </div>

      {error && (
        <div className="alert alert-critical" style={{ marginBottom: '16px' }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Supported Evidence Types Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '32px',
      }}>
        {[
          { icon: '📱', title: 'Bank Screenshots', desc: 'UPI, NEFT, IMPS transaction screenshots. OCR extracts amounts, UTR IDs, dates.' },
          { icon: '📄', title: 'PDF Documents', desc: 'Bank statements, offer letters, receipts. Text extracted and analyzed automatically.' },
          { icon: '💬', title: 'Chat Screenshots', desc: 'WhatsApp, Telegram, SMS screenshots with conversation evidence.' },
          { icon: '📧', title: 'Email Evidence', desc: 'Screenshot or text export of phishing emails, job offers, fraud communications.' },
        ].map((item, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', color: 'var(--color-text-primary)' }}>{item.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Uploaded Files */}
      {evidenceFiles.length > 0 && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              📂 Analyzed Evidence ({evidenceFiles.length})
            </h3>
          </div>
          <div>
            {evidenceFiles.map((ef, i) => (
              <EvidenceFileRow key={ef.id || i} file={ef} onSelect={setSelectedFile} />
            ))}
          </div>
        </div>
      )}

      {/* Selected File Detail Modal */}
      {selectedFile && (
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
        }} onClick={() => setSelectedFile(null)}>
          <div
            className="glass-card"
            style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '24px', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>
                  {selectedFile.filename || selectedFile.original_filename}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px', textTransform: 'capitalize' }}>
                  {(selectedFile.document_type || 'document').replace('_', ' ')} · {selectedFile.file_size_kb ? `${selectedFile.file_size_kb} KB` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`${API_BASE}/api/evidence/file/${selectedFile.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  🔗 Open File
                </a>
                <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setSelectedFile(null)}>✕</button>
              </div>
            </div>

            {/* Visual Attachment Preview */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-blue-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                📷 Attached File Preview
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '220px',
                maxHeight: '450px',
                overflow: 'hidden',
              }}>
                {selectedFile.file_type === 'image' || (selectedFile.filename && selectedFile.filename.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/i)) ? (
                  <img
                    src={`${API_BASE}/api/evidence/file/${selectedFile.id}`}
                    alt={selectedFile.filename}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '420px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : selectedFile.file_type === 'pdf' || (selectedFile.filename && selectedFile.filename.match(/\.pdf$/i)) ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={`${API_BASE}/api/evidence/preview/${selectedFile.id}`}
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
                      href={`${API_BASE}/api/evidence/file/${selectedFile.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      📄 View Full PDF Document
                    </a>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📝</div>
                    <div>Text Document Attachment</div>
                  </div>
                )}
                <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🖼️</div>
                  <div>Attached Screenshot / Image</div>
                </div>
              </div>
            </div>

            {selectedFile.ocr_preview && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  📖 OCR Extracted Text
                </div>
                <pre style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {selectedFile.ocr_preview}
                </pre>
              </div>
            )}

            {selectedFile.entities && Object.keys(selectedFile.entities).length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🔍 Extracted Entities
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                  {Object.entries(selectedFile.entities).map(([key, values]) => (
                    <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-blue-light)', minWidth: '120px', textTransform: 'capitalize' }}>
                        {key.replace('_', ' ')}:
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                        {Array.isArray(values) ? values.join(', ') : values}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceFileRow({ file, onSelect }) {
  const sizeKb = ((file.file_size_kb || 0)).toFixed(0);
  const docType = (file.document_type || 'document').replace('_', ' ');
  const isImage = file.file_type === 'image' || (file.filename && file.filename.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/i));

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 20px',
      borderBottom: '1px solid rgba(59,130,246,0.06)',
      transition: 'background 0.15s',
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Thumbnail or Icon */}
      <div
        onClick={() => onSelect(file)}
        style={{
          width: 52,
          height: 52,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          flexShrink: 0,
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {isImage ? (
          <img
            src={`${API_BASE}/api/evidence/preview/${file.id}`}
            alt={file.filename}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span style={{ display: isImage ? 'none' : 'flex' }}>
          {file.file_type === 'image' ? '🖼️' : file.file_type === 'pdf' ? '📄' : '📝'}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onSelect(file)}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '3px' }} className="truncate">
          {file.filename || file.original_filename}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ textTransform: 'capitalize', color: 'var(--color-blue-light)', fontWeight: 600 }}>{docType}</span>
          {sizeKb > 0 && <span>· {sizeKb} KB</span>}
          {file.confidence && <span>· OCR {Math.round(file.confidence || 0)}% confidence</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
        {file.is_processed && (
          <span style={{
            fontSize: '0.72rem',
            background: 'rgba(34,197,94,0.1)',
            color: 'var(--color-success)',
            padding: '3px 10px',
            borderRadius: '999px',
            border: '1px solid rgba(34,197,94,0.2)',
          }}>✓ Analyzed</span>
        )}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onSelect(file)}
          id={`view-evidence-${file.id}`}
        >
          🔍 View File
        </button>
      </div>
    </div>
  );
}
