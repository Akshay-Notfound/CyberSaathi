import useStore, { api } from './useStore';

export const useComplaintStore = () => {
  const store = useStore();
  const rawComplaint = store.complaints.find((c) => String(c.id) === String(store.activeComplaintId));
  
  const activeComplaint = {
    id: store.activeComplaintId,
    title: rawComplaint?.title || (store.activeComplaintId ? `Case #${store.activeComplaintId}` : 'New Case'),
    crime_category: rawComplaint?.crime_category || store.classification?.category,
    risk_level: rawComplaint?.risk_level || store.risk?.level || 'MEDIUM',
    risk_score: rawComplaint?.risk_score || store.risk?.score,
    incident_date: rawComplaint?.incident_date || null,
    financial_loss: rawComplaint?.financial_loss ?? null,
    generated_complaint: rawComplaint?.complaint_text || rawComplaint?.incident_description || store.complaintText || '',
    checklist: rawComplaint?.evidence_checklist || store.evidenceChecklist || [
      'Screenshots of fraudulent transaction / payment receipt',
      'Bank account statement showing debited amount',
      'SMS / Chat communication records with perpetrator',
      'Caller ID / Phone number records / WhatsApp chat export',
    ],
    timeline: rawComplaint?.timeline || store.timeline || [],
    extracted_entities: rawComplaint?.extracted_entities || store.extractedEntities || {},
  };

  return {
    complaints: store.complaints || [],
    activeComplaint,
    messages: store.chatMessages || [],
    evidence: store.evidenceFiles || [],
    loading: false,
    fetchComplaints: async () => {
      await store.loadComplaints();
    },
    fetchComplaint: async (id) => {
      store.setActiveComplaint(id);
      try {
        const res = await api.get(`/api/complaint/${id}`);
        const c = res.data;
        // update local complaint text
        useStore.setState((s) => ({
          complaintText: c.complaint_text || c.incident_description,
          evidenceChecklist: c.evidence_checklist || s.evidenceChecklist,
          timeline: c.timeline || s.timeline,
          extractedEntities: c.extracted_entities || s.extractedEntities,
        }));
      } catch (e) {
        // fallback
      }
      if (store.complaints.length === 0) {
        await store.loadComplaints();
      }
      try {
        await store.loadChatHistory(id);
        await store.loadEvidence(id);
      } catch (e) {
        // history load fallback
      }
    },
    reanalyze: async (complaintId) => {
      const res = await api.post('/api/complaint/generate', { complaint_id: complaintId });
      useStore.setState((s) => ({
        complaintText: res.data.complaint_text,
        timeline: res.data.timeline || s.timeline,
        evidenceChecklist: res.data.evidence_checklist || s.evidenceChecklist,
        extractedEntities: res.data.extracted_entities || s.extractedEntities,
      }));
      await store.loadComplaints();
      return res.data;
    },
    updateComplaint: async (complaintId, fields) => {
      await api.patch(`/api/complaint/${complaintId}`, fields);
      // trigger re-analysis to refresh draft with updated fields
      try {
        await api.post('/api/complaint/generate', { complaint_id: complaintId });
      } catch (e) {}
      await store.loadComplaints();
    },
    fetchMessages: async (complaintId) => {
      if (complaintId) {
        store.setActiveComplaint(complaintId);
        try {
          await store.loadChatHistory(complaintId);
          return useStore.getState().chatMessages || [];
        } catch (e) {
          return [];
        }
      }
      return store.chatMessages || [];
    },
    fetchEvidence: async (complaintId) => {
      if (complaintId) {
        store.setActiveComplaint(complaintId);
        return await store.loadEvidence(complaintId);
      }
      return store.evidenceFiles || [];
    },
    uploadEvidence: async (complaintId, file) => {
      return await store.uploadEvidence(complaintId, file);
    },
    deleteEvidence: async (evidenceId, complaintId) => {
      return await store.deleteEvidence(evidenceId, complaintId);
    },
    startChat: async (complaintId) => {
      if (complaintId) {
        store.setActiveComplaint(complaintId);
      }
      if (!store.chatMessages || store.chatMessages.length === 0) {
        return await store.startComplaint();
      }
      return store.activeComplaintId;
    },
    sendMessage: async (complaintIdOrText, textArg) => {
      let text = complaintIdOrText;
      if (textArg !== undefined) {
        const cId = complaintIdOrText;
        text = textArg;
        if (cId) store.setActiveComplaint(cId);
      }
      return await store.sendMessage(text);
    },
    createComplaint: async (title = 'Untitled Incident') => {
      const id = await store.startComplaint();
      await store.loadComplaints();
      return { id };
    },
    setActiveComplaint: store.setActiveComplaint,
  };
};

export default useComplaintStore;
