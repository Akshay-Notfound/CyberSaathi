import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import CaseWorkspace from "./pages/CaseWorkspace";
import Chat from "./pages/Chat";
import ComplaintDraft from "./pages/ComplaintDraft";
import Dashboard from "./pages/Dashboard";
import Evidence from "./pages/Evidence";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MLDashboard from "./pages/MLDashboard";
import Register from "./pages/Register";

import useStore from "./store/useStore";

function ActiveCaseRedirect({ subpath = "chat" }) {
  const activeComplaintId = useStore((s) => s.activeComplaintId);
  if (activeComplaintId) {
    return <Navigate to={`/case/${activeComplaintId}/${subpath}`} replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ml-dashboard"
        element={
          <ProtectedRoute>
            <MLDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/model-comparison"
        element={
          <ProtectedRoute>
            <MLDashboard />
          </ProtectedRoute>
        }
      />

      {/* Direct path fallbacks */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ActiveCaseRedirect subpath="chat" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence"
        element={
          <ProtectedRoute>
            <ActiveCaseRedirect subpath="evidence" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaint"
        element={
          <ProtectedRoute>
            <ActiveCaseRedirect subpath="complaint" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/case/:complaintId"
        element={
          <ProtectedRoute>
            <CaseWorkspace />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="chat" replace />} />
        <Route path="chat" element={<Chat />} />
        <Route path="evidence" element={<Evidence />} />
        <Route path="complaint" element={<ComplaintDraft />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
