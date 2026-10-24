import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min for AI responses
});

// ── Safety Monitoring ──────────────────────────────────────
export const safetyAPI = {
  analyzeImage: (formData) =>
    api.post('/safety/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeText: (data) => api.post('/safety/analyze-text', data),
};

// ── Crack Detection ───────────────────────────────────────
export const crackAPI = {
  analyze: (formData) =>
    api.post('/crack/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Real Estate Valuation ─────────────────────────────────
export const valuationAPI = {
  estimate: (data) => api.post('/valuation/estimate', data),
  analyzePropertyImage: (formData) =>
    api.post('/valuation/analyze-property-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Project Planning ──────────────────────────────────────
export const planningAPI = {
  generatePlan: (data) => api.post('/planning/generate-plan', data),
  costEstimate: (data) => api.post('/planning/cost-estimate', data),
};

// ── Site Assistance ───────────────────────────────────────
export const assistanceAPI = {
  chat: (data) => api.post('/assistance/chat', data),
  dailyReport: (data) => api.post('/assistance/daily-report', data),
};

// ── Weather Advisory ──────────────────────────────────────
export const weatherAPI = {
  getAdvisory: (data) => api.post('/weather/advisory', data),
};

// ── Knowledge Assistant ───────────────────────────────────
export const knowledgeAPI = {
  ask: (data) => api.post('/knowledge/ask', data),
  analyzeDrawing: (formData) =>
    api.post('/knowledge/analyze-drawing', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  generateQuiz: (data) => api.post('/knowledge/quiz', data),
};

// ── Health ────────────────────────────────────────────────
export const healthAPI = {
  check: () => axios.get('http://localhost:8000/health'),
};

export default api;
