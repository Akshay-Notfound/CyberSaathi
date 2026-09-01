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

      login: async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        set({ token: res.data.access_token, user: res.data.user, isAuthenticated: true });
        return res.data;
      },

      register: async (email, full_name, password, phone) => {
        const res = await api.post('/api/auth/register', { email, full_name, password, phone });
        set({ token: res.data.access_token, user: res.data.user, isAuthenticated: true });
        return res.data;
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false, complaints: [] }),

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
      uploadEvidence: async (file) => {
        const state = get();
        const formData = new FormData();
        formData.append('complaint_id', state.activeComplaintId);
        formData.append('file', file);
        const res = await api.post('/api/evidence/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        set((s) => ({
          evidenceFiles: [...s.evidenceFiles, res.data],
          extractedEntities: { ...s.extractedEntities, ...(res.data.entities || {}) },
        }));
        return res.data;
      },

      loadEvidence: async (complaintId) => {
        const res = await api.get(`/api/evidence/${complaintId}`);
        set({ evidenceFiles: res.data.evidence_files || [] });
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
