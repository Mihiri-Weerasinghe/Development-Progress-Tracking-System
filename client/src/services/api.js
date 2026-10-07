import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const checkServerHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
