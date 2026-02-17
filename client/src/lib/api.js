const API_BASE = '/api';

async function request(url, options = {}) {
  const config = {
    headers: {},
    ...options,
  };

  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }
  }

  const res = await fetch(`${API_BASE}${url}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Customers
  getCustomers: (params) => request(`/customers?${new URLSearchParams(params || {})}`),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: data }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: data }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Trips
  getTrips: (params) => request(`/trips?${new URLSearchParams(params || {})}`),
  getTrip: (id) => request(`/trips/${id}`),
  createTrip: (data) => request('/trips', { method: 'POST', body: data }),
  updateTrip: (id, data) => request(`/trips/${id}`, { method: 'PUT', body: data }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),
  addTripStop: (tripId, data) => request(`/trips/${tripId}/stops`, { method: 'POST', body: data }),
  updateTripStop: (stopId, data) => request(`/trips/stops/${stopId}`, { method: 'PUT', body: data }),
  deleteTripStop: (stopId) => request(`/trips/stops/${stopId}`, { method: 'DELETE' }),

  // Checks
  getChecks: (params) => request(`/checks?${new URLSearchParams(params || {})}`),
  getCheck: (id) => request(`/checks/${id}`),
  createCheck: (formData) => fetch(`${API_BASE}/checks`, { method: 'POST', body: formData }).then(r => r.json()),
  updateCheck: (id, formData) => fetch(`${API_BASE}/checks/${id}`, { method: 'PUT', body: formData }).then(r => r.json()),
  deleteCheck: (id) => request(`/checks/${id}`, { method: 'DELETE' }),

  // LINE
  sendLine: (data) => request('/line/send', { method: 'POST', body: data }),
  sendDailySummary: (data) => request('/line/send-daily-summary', { method: 'POST', body: data }),
  sendCheckToLine: (checkId) => request(`/line/send-check/${checkId}`, { method: 'POST' }),
  sendTodayPlan: (data) => request('/line/send-today-plan', { method: 'POST', body: data }),
  sendDepositStatus: (data) => request('/line/send-deposit-status', { method: 'POST', body: data }),
  previewTodayPlan: (params) => request(`/line/preview-today-plan?${new URLSearchParams(params || {})}`),
  previewDepositStatus: (params) => request(`/line/preview-deposit-status?${new URLSearchParams(params || {})}`),
  getLineHistory: () => request('/line/history'),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: data }),

  // Reports
  getDashboard: () => request('/reports/dashboard'),
  getMonthlyReport: (params) => request(`/reports/monthly?${new URLSearchParams(params || {})}`),
};
