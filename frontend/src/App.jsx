import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, FolderOpen, FileText, BarChart2, LogOut, Shield } from 'lucide-react';
import './index.css';
import useStore from './store/useStore';

// Pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Evidence from './pages/Evidence';
import Complaint from './pages/Complaint';
import ModelComparison from './pages/ModelComparison';

// ─── Protected Route ──────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

// ─── Sidebar ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageSquare, label: 'Chat & Report' },
  { to: '/evidence', icon: FolderOpen, label: 'Evidence Upload' },
  { to: '/complaint', icon: FileText, label: 'Complaint Review' },
  { to: '/model-comparison', icon: BarChart2, label: 'ML Benchmarks' },
];

function Sidebar() {
  const { user, logout, activeComplaintId, risk } = useStore();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🛡️</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-title">CyberSaathi</div>
          <div className="sidebar-logo-subtitle">AI Complaint System</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section">Main</div>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${to.replace('/', '')}`}
          >
            <Icon className="nav-icon" />
            {label}
            {/* Badge for chat if active complaint */}
            {to === '/chat' && activeComplaintId && risk?.level === 'CRITICAL' && (
              <span style={{
                marginLeft: 'auto',
                width: 8, height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                animation: 'pulse-critical 2s infinite',
                flexShrink: 0,
              }} />
            )}
          </NavLink>
        ))}

        <div className="sidebar-section">Quick Links</div>
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-item"
          style={{ textDecoration: 'none' }}
        >
          <Shield className="nav-icon" />
          cybercrime.gov.in ↗
        </a>
        <div className="nav-item" style={{ color: 'var(--color-critical)', cursor: 'default' }}>
          <span style={{ fontSize: '1rem' }}>📞</span>
          Helpline: 1930
        </div>
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: '8px', padding: '10px', background: 'rgba(59,130,246,0.06)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.full_name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        )}
        <button
          className="nav-item"
          onClick={logout}
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          id="sidebar-logout-btn"
        >
          <LogOut className="nav-icon" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Welcome Toast ──────────────────────────────────────────────────
function WelcomeToast() {
  const user = useStore((s) => s.user);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) {
      const shown = sessionStorage.getItem(`welcomeShown_${user.id}`);
      if (!shown) {
        setShow(true);
        sessionStorage.setItem(`welcomeShown_${user.id}`, 'true');
        setTimeout(() => setShow(false), 5000);
      }
    }
  }, [user]);

  if (!show || !user) return null;

  return (
    <div className="welcome-toast">
      नमस्ते {user.full_name}, CyberSaathi में आपका स्वागत है!
    </div>
  );
}

// ─── App Layout ───────────────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <WelcomeToast />
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>}
        />
        <Route
          path="/chat"
          element={<ProtectedRoute><AppLayout><Chat /></AppLayout></ProtectedRoute>}
        />
        <Route
          path="/evidence"
          element={<ProtectedRoute><AppLayout><Evidence /></AppLayout></ProtectedRoute>}
        />
        <Route
          path="/complaint"
          element={<ProtectedRoute><AppLayout><Complaint /></AppLayout></ProtectedRoute>}
        />
        <Route
          path="/model-comparison"
          element={<ProtectedRoute><AppLayout><ModelComparison /></AppLayout></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
