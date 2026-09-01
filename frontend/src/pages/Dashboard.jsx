import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, AlertTriangle, CheckCircle, Plus, TrendingUp, Shield, Clock } from 'lucide-react';
import useStore from '../store/useStore';
import RiskBadge from '../components/RiskBadge';

const STATUS_LABELS = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  COMPLETE: 'Complete',
  SUBMITTED: 'Submitted',
};

const STATUS_COLORS = {
  DRAFT: 'status-draft',
  IN_PROGRESS: 'status-in-progress',
  COMPLETE: 'status-complete',
  SUBMITTED: 'status-submitted',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, complaints, loadComplaints, startComplaint, setActiveComplaint } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints().finally(() => setLoading(false));
  }, []);

  const handleNewComplaint = async () => {
    await startComplaint();
    navigate('/chat');
  };

  const handleOpenComplaint = async (complaint) => {
    setActiveComplaint(complaint.id);
    navigate('/chat');
  };

  // Stats
  const totalComplaints = complaints.length;
  const criticalCount = complaints.filter((c) => c.risk_level === 'CRITICAL').length;
  const completeCount = complaints.filter((c) => c.status === 'COMPLETE' || c.status === 'SUBMITTED').length;
  const totalLoss = complaints.reduce((sum, c) => sum + (c.financial_loss || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="section-header">
        <div>
          <div className="section-title">
            <Shield size={24} color="var(--color-blue-primary)" />
            Dashboard
          </div>
          <div className="section-subtitle">
            Welcome back, {user?.full_name || 'User'} · Your cybercrime complaint overview
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleNewComplaint} id="new-complaint-btn">
          <Plus size={18} />
          New Complaint
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <StatCard
          icon={<FileText size={20} />}
          iconColor="#3b82f6"
          value={totalComplaints}
          label="Total Complaints"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          iconColor="#ef4444"
          value={criticalCount}
          label="Critical Incidents"
          valueColor={criticalCount > 0 ? '#ef4444' : undefined}
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          iconColor="#22c55e"
          value={completeCount}
          label="Completed"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          iconColor="#f97316"
          value={totalLoss > 0 ? `₹${(totalLoss / 1000).toFixed(0)}K` : '₹0'}
          label="Total Reported Loss"
        />
      </div>

      {/* Urgent Alert */}
      {criticalCount > 0 && (
        <div className="alert alert-critical" style={{ marginBottom: '24px' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Urgent Action Required</strong> — You have {criticalCount} critical-risk complaint{criticalCount > 1 ? 's' : ''}.
            Call the National Cybercrime Helpline <strong>1930</strong> immediately or visit{' '}
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 700 }}>
              cybercrime.gov.in
            </a>
          </div>
        </div>
      )}

      {/* Complaints Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--color-blue-primary)" />
            Your Complaints
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{totalComplaints} total</span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛡️</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
              No complaints yet
            </div>
            <p style={{ marginBottom: '24px' }}>
              Start a new complaint to report a cybercrime incident with AI assistance.
            </p>
            <button className="btn btn-primary" onClick={handleNewComplaint}>
              <Plus size={18} /> Start Your First Complaint
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Crime Category</th>
                  <th>Risk</th>
                  <th>Loss</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenComplaint(c)}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>#{c.id}</td>
                    <td style={{ fontWeight: 600, maxWidth: '200px' }}>
                      <div className="truncate">{c.title || `Complaint #${c.id}`}</div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.8rem',
                        background: 'rgba(59,130,246,0.1)',
                        color: 'var(--color-blue-light)',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        border: '1px solid rgba(59,130,246,0.2)',
                        whiteSpace: 'nowrap',
                      }}>
                        {c.crime_category || '—'}
                      </span>
                    </td>
                    <td><RiskBadge level={c.risk_level} /></td>
                    <td style={{ fontWeight: 600 }}>
                      {c.financial_loss ? `₹${Number(c.financial_loss).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${STATUS_COLORS[c.status] || ''}`}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleOpenComplaint(c); }}
                      >
                        Open →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
      }}>
        {[
          { icon: '📞', label: 'National Cybercrime Helpline', value: '1930', sub: 'Call immediately for urgent cases' },
          { icon: '🌐', label: 'Official Reporting Portal', value: 'cybercrime.gov.in', sub: 'File your complaint online', link: 'https://cybercrime.gov.in' },
          { icon: '💡', label: 'AI Model Comparison', value: 'View Benchmarks →', sub: 'See ML model accuracy comparison', link: '/model-comparison' },
        ].map((item, i) => (
          <a
            key={i}
            href={item.link || '#'}
            target={item.link?.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
            onClick={item.link?.startsWith('/') ? (e) => { e.preventDefault(); navigate(item.link); } : undefined}
          >
            <div className="glass-card" style={{ padding: '16px 20px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>{item.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.sub}</div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, iconColor, value, label, valueColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${iconColor}18`, color: iconColor }}>
        {icon}
      </div>
      <div className="stat-value" style={{ color: valueColor }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
