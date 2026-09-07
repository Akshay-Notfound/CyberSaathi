import React, { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import CaseSidebar from "../components/CaseSidebar";
import Navbar from "../components/Navbar";
import useComplaintStore from "../store/complaintStore";

export default function CaseWorkspace() {
  const { complaintId, id } = useParams();
  const effectiveId = complaintId || id;
  const { activeComplaint, fetchComplaint } = useComplaintStore();

  useEffect(() => {
    if (effectiveId) {
      fetchComplaint(effectiveId);
    }
  }, [effectiveId]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020817", color: "#f1f5f9" }}>
      <Navbar />
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "row",
        minHeight: "calc(100vh - 64px)",
      }}>
        <CaseSidebar complaint={activeComplaint} complaintId={effectiveId} />
        <main style={{ minWidth: 0, flex: 1, padding: "24px" }}>
          <Outlet context={{ complaintId: effectiveId, complaint: activeComplaint }} />
        </main>
      </div>
    </div>
  );
}
