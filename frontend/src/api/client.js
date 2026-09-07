import axios from "axios";

const client = axios.create({
  // In dev, Vite proxies /api to the local backend (see vite.config.js).
  // In production, set VITE_API_URL to your deployed backend's base URL,
  // e.g. https://api.yourdomain.com/api or http://127.0.0.1:8000/api
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : "/api",
});

client.interceptors.request.use((config) => {
  // Try direct token key, then zustand persisted store
  let token = localStorage.getItem("cybersaathi_token");
  if (!token) {
    try {
      const persisted = JSON.parse(localStorage.getItem("cybersaathi-store") || "{}");
      token = persisted?.state?.token;
    } catch (e) {}
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Normalize common path shorthands
  if (config.url) {
    if (config.url.startsWith("/complaints")) {
      config.url = config.url.replace(/^\/complaints/, "/complaint");
    }
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cybersaathi_token");
      localStorage.removeItem("cybersaathi_user");
      localStorage.removeItem("cybersaathi-store");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default client;
