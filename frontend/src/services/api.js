/**
 * VIT Shuttle — API Service Layer
 * Centralizes all backend communication
 */
const isProd = import.meta.env.PROD || window.location.hostname.includes('vercel.app');
const BASE = isProd ? '/api' : `http://${window.location.hostname}:5002/api`;

function getToken() {
  try {
    const auth = JSON.parse(localStorage.getItem('vit-auth') || 'null');
    return auth?.token || '';
  } catch { return ''; }
}

function buildHeaders(json = true) {
  const h = {};
  const token = getToken();
  if (token) h.Authorization = `Bearer ${token}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function request(path, opts = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...opts,
      headers: { ...buildHeaders(), ...(opts.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Make sure the backend is running on port 5002.');
    }
    throw err;
  }
}

// ── Auth ──────────────────────────────────────────────
export const auth = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  signup: (payload) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),

  sendOtp: (email) =>
    request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) }),

  verifyOtp: (email, otp) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),

  me: () => request('/auth/me'),

  updateProfile: (data) =>
    request('/auth/update-profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Passes ────────────────────────────────────────────
export const passes = {
  myPasses: () => request('/passes/my'),
  active: () => request('/passes/active'),
  verify: (qrCode) => request(`/passes/verify/${qrCode}`),
};

// ── Payments ──────────────────────────────────────────
export const payments = {
  createOrder: (passType) =>
    request('/payments/create-order', { method: 'POST', body: JSON.stringify({ passType }) }),

  verify: (payload) =>
    request('/payments/verify', { method: 'POST', body: JSON.stringify(payload) }),

  history: () => request('/payments/history'),
};

// ── Users / Dashboard ─────────────────────────────────
export const users = {
  dashboard: () => request('/users/dashboard'),
  markNotificationsRead: () =>
    request('/users/notifications/read', { method: 'PATCH' }),
};

// ── Admin ─────────────────────────────────────────────
export const admin = {
  stats: () => request('/admin/stats'),
  users: (page = 1, search = '') => request(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`),
  toggleUser: (id) => request(`/admin/users/${id}/toggle`, { method: 'PATCH' }),
  payments: (page = 1) => request(`/admin/payments?page=${page}`),
  complaints: (status = '') => request(`/admin/complaints${status ? `?status=${status}` : ''}`),
  updateComplaint: (id, data) => request(`/admin/complaints/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  scanlogs: (page = 1) => request(`/admin/scanlogs?page=${page}`),
  analytics: () => request('/admin/analytics/revenue'),
  analyticsOverview: () => request('/admin/analytics/overview'),

  // Route CRUD
  getRoutes: () => request('/admin/routes'),
  createRoute: (data) => request('/admin/routes', { method: 'POST', body: JSON.stringify(data) }),
  updateRoute: (id, data) => request(`/admin/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoute: (id) => request(`/admin/routes/${id}`, { method: 'DELETE' }),

  // Stop CRUD
  getStops: () => request('/admin/stops'),
  createStop: (data) => request('/admin/stops', { method: 'POST', body: JSON.stringify(data) }),
  updateStop: (id, data) => request(`/admin/stops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStop: (id) => request(`/admin/stops/${id}`, { method: 'DELETE' }),

  // Driver CRUD
  getDrivers: () => request('/admin/drivers'),
  createDriver: (data) => request('/admin/drivers', { method: 'POST', body: JSON.stringify(data) }),
  updateDriver: (id, data) => request(`/admin/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDriver: (id) => request(`/admin/drivers/${id}`, { method: 'DELETE' }),

  // Shuttle CRUD (enhanced)
  getShuttles: () => request('/admin/shuttles'),
  createShuttle: (data) => request('/admin/shuttles', { method: 'POST', body: JSON.stringify(data) }),
  updateShuttle: (id, data) => request(`/admin/shuttles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteShuttle: (id) => request(`/admin/shuttles/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request('/admin/settings'),
  updateSettings: (settings) => request('/admin/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),

  // Audit Log
  getAuditLog: (page = 1, action = '', startDate = '', endDate = '') => {
    const params = new URLSearchParams({ page });
    if (action) params.append('action', action);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request(`/admin/audit-log?${params}`);
  },

  // GPS Logs
  getGpsLogs: (shuttleId = '', startDate = '', endDate = '', page = 1) => {
    const params = new URLSearchParams({ page });
    if (shuttleId) params.append('shuttleId', shuttleId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return request(`/admin/gps-logs?${params}`);
  },

  // Notifications
  pushNotification: (data) => request('/admin/notifications/push', { method: 'POST', body: JSON.stringify(data) }),

  // Schedule
  getSchedule: () => request('/admin/schedule'),
  updateSchedule: (data) => request('/admin/schedule', { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Shuttles ──────────────────────────────────────────
export const shuttles = {
  list: () => request('/shuttles'),
};

// ── Card (Shuttle Card) ───────────────────────────────
export const card = {
  getCard: () => request('/card'),
  transactions: () => request('/card/transactions'),
  topup: (amount) =>
    request('/card/topup', { method: 'POST', body: JSON.stringify({ amount }) }),
  verifyTopup: (payload) =>
    request('/card/verify-topup', { method: 'POST', body: JSON.stringify(payload) }),
};

// ── Complaints ────────────────────────────────────────
export const complaints = {
  submit: (data) =>
    request('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  myComplaints: () => request('/complaints/my'),
  track: (trackingId) => request(`/complaints/track/${trackingId}`),
};

// ── Public (no auth) ──────────────────────────────────
export const publicApi = {
  getRoutes: (search = '') => request(`/public/routes${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getRoute: (id) => request(`/public/routes/${id}`),
  getStops: (lat, lng) => {
    const params = new URLSearchParams();
    if (lat && lng) { params.append('lat', lat); params.append('lng', lng); }
    const qs = params.toString();
    return request(`/public/stops${qs ? `?${qs}` : ''}`);
  },
  getLiveShuttles: () => request('/public/shuttles/live'),
  getAlerts: () => request('/public/alerts'),
  submitFeedback: (data) => request('/public/feedback', { method: 'POST', body: JSON.stringify(data) }),
};

export default { auth, passes, payments, users, admin, shuttles, card, complaints, publicApi };
