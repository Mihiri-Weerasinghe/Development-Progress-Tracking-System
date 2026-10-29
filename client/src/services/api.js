import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zeo_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication endpoints
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Item endpoints
export const getItems = async () => {
  const response = await api.get('/items');
  return response.data;
};

export const createItem = async (itemData) => {
  const response = await api.post('/items', itemData);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

// Funding Resource endpoints
export const getFundingSources = async () => {
  const response = await api.get('/funding');
  return response.data;
};

export const getFundingSourceById = async (id) => {
  const response = await api.get(`/funding/${id}`);
  return response.data;
};

export const createFundingSource = async (data) => {
  const response = await api.post('/funding', data);
  return response.data;
};

export const updateFundingSource = async (id, data) => {
  const response = await api.put(`/funding/${id}`, data);
  return response.data;
};

export const deleteFundingSource = async (id) => {
  const response = await api.delete(`/funding/${id}`);
  return response.data;
};

// Fund Activity Record Endpoints (Government Detailed Progress Sheet)
export const getFundRecords = async (fundCode) => {
  const response = await api.get(`/funding/${fundCode}/records`);
  return response.data;
};

export const createFundRecord = async (fundCode, recordData) => {
  const response = await api.post(`/funding/${fundCode}/records`, recordData);
  return response.data;
};

export const updateFundRecord = async (recordId, recordData) => {
  const response = await api.put(`/funding/records/${recordId}`, recordData);
  return response.data;
};

export const deleteFundRecord = async (recordId) => {
  const response = await api.delete(`/funding/records/${recordId}`);
  return response.data;
};

export const checkServerHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Admin User Management endpoints
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateUserStatus = async (id, status, role) => {
  const response = await api.put(`/users/${id}/status`, { status, role });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export default api;
