import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configure axios
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { api };

const useStore = create(
  persist(
    (set, get) => ({
      // ─── Auth ───────────────────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (emailOrObj, passwordArg) => {
        let email, password;
        if (typeof emailOrObj === 'object' && emailOrObj !== null) {
          email = emailOrObj.email;
          password = emailOrObj.password;
        } else {
          email = emailOrObj;
          password = passwordArg;
        }
        const res = await api.post('/api/auth/login', { email, password });
        localStorage.setItem('cybersaathi_token', res.data.access_token);
        localStorage.setItem('cybersaathi_user', JSON.stringify(res.data.user));
        set({ token: res.data.access_token, user: res.data.user, isAuthenticated: true });
        return { ok: true, ...res.data };
      },

      register: async (emailOrObj, fullNameArg, passwordArg, phoneArg) => {
        let email, full_name, password, phone;
        if (typeof emailOrObj === 'object' && emailOrObj !== null) {
          email = emailOrObj.email;
          full_name = emailOrObj.full_name;
          password = emailOrObj.password;
          phone = emailOrObj.phone || '';
        } else {
          email = emailOrObj;
          full_name = fullNameArg;
          password = passwordArg;
          phone = phoneArg || '';
        }
        const res = await api.post('/api/auth/register', { email, full_name, password, phone });
        localStorage.setItem('cybersaathi_token', res.data.access_token);
        localStorage.setItem('cybersaathi_user', JSON.stringify(res.data.user));
        set({ token: res.data.access_token, user: res.data.user, isAuthenticated: true });
        return { ok: true, ...res.data };
      },

      logout: () => {
        localStorage.removeItem('cybersaathi_token');
        localStorage.removeItem('cybersaathi_user');
        set({ user: null, token: null, isAuthenticated: false, complaints: [] });
      },

      // ─── Active Complaint ────────────────────────────────────────────
      activeComplaintId: null,
      chatMessages: [],
      extractedEntities: {},
      classification: null,
      risk: null,
      missingInfo: [],
      evidenceChecklist: [],
      evidenceFiles: [],

      setActiveComplaint: (id) => set({ activeComplaintId: id }),

      startComplaint: async () => {
        const res = await api.post('/api/chat/start');
        set({
          activeComplaintId: res.data.complaint_id,
          chatMessages: [{
            role: 'assistant',
            content: "Namaste! I'm CyberSaathi, your AI cybercrime complaint assistant. I'm here to help you document and report a cybercrime incident. Please tell me what happened — describe the incident in your own words.",
            id: Date.now(),
          }],
          extractedEntities: {},
          classification: null,
          risk: null,
          missingInfo: [],
          evidenceChecklist: [],
          evidenceFiles: [],
        });
        return res.data.complaint_id;
      },

      sendMessage: async (message) => {
        const state = get();
        // Add user message immediately
        set((s) => ({
          chatMessages: [...s.chatMessages, { role: 'user', content: message, id: Date.now() }],
        }));

        const res = await api.post('/api/chat/message', {
          complaint_id: state.activeComplaintId,
          message,
        });

        // Add bot reply
        set((s) => ({
          chatMessages: [...s.chatMessages, { role: 'assistant', content: res.data.reply, id: Date.now() + 1 }],
          extractedEntities: res.data.extracted_entities || {},
          classification: res.data.classification || null,
          risk: res.data.risk || null,
          missingInfo: res.data.missing_info || [],
          evidenceChecklist: res.data.evidence_checklist || [],
          activeComplaintId: res.data.complaint_id,
        }));

        return res.data;
      },

      loadChatHistory: async (complaintId) => {
        const res = await api.get(`/api/chat/${complaintId}/history`);
        set({ chatMessages: res.data.messages, activeComplaintId: complaintId });
      },

      // ─── Evidence ────────────────────────────────────────────────────
      uploadEvidence: async (complaintIdOrFile, fileArg) => {
        const state = get();
        let complaintId = state.activeComplaintId;
        let file = complaintIdOrFile;
        if (fileArg !== undefined) {
          complaintId = complaintIdOrFile;
          file = fileArg;
        }
        const formData = new FormData();
        formData.append('complaint_id', complaintId);
        formData.append('file', file);
        const res = await api.post('/api/evidence/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const formatted = {
          id: res.data.id,
          filename: res.data.filename || file.name,
          file_type: res.data.file_type || 'image',
          document_type: res.data.document_type,
          extracted_text: res.data.extracted_text,
          detected_entities: res.data.entities || res.data.detected_entities || {},
          ocr_preview: res.data.extracted_text ? res.data.extracted_text.slice(0, 200) : '',
        };
        set((s) => ({
          evidenceFiles: [...s.evidenceFiles, formatted],
          extractedEntities: { ...s.extractedEntities, ...(res.data.entities || {}) },
        }));
        return res.data;
      },

      loadEvidence: async (complaintId) => {
        const res = await api.get(`/api/evidence/${complaintId}`);
        const files = (res.data.evidence_files || []).map((f) => ({
          id: f.id,
          filename: f.filename,
          file_type: f.file_type,
          document_type: f.document_type,
          extracted_text: f.ocr_preview || f.extracted_text,
          detected_entities: f.entities || {},
          uploaded_at: f.uploaded_at,
        }));
        set({ evidenceFiles: files });
        return files;
      },

      deleteEvidence: async (evidenceId, complaintId) => {
        await api.delete(`/api/evidence/${evidenceId}`);
        set((s) => ({
          evidenceFiles: s.evidenceFiles.filter((f) => f.id !== evidenceId),
        }));
      },

      // ─── Complaint List ──────────────────────────────────────────────
      complaints: [],

      loadComplaints: async () => {
        const res = await api.get('/api/complaint/list');
        set({ complaints: res.data.complaints || [] });
      },

      generateComplaint: async () => {
        const state = get();
        const res = await api.post('/api/complaint/generate', {
          complaint_id: state.activeComplaintId,
        });
        return res.data;
      },

      // ─── ML Benchmark ────────────────────────────────────────────────
      benchmarkResults: null,
      benchmarkLoading: false,

      loadBenchmark: async () => {
        set({ benchmarkLoading: true });
        try {
          const res = await api.get('/api/ml/benchmark');
          set({ benchmarkResults: res.data, benchmarkLoading: false });
        } catch (e) {
          set({ benchmarkLoading: false });
        }
      },

      trainModels: async () => {
        await api.post('/api/ml/train');
      },
    }),
    {
      name: 'cybersaathi-store',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useStore;
