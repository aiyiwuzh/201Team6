import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHello = async () => {
  const response = await api.get('/hello');
  return response.data;
};

export const getStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const postEcho = async (message: string) => {
  const response = await api.post('/echo', { message });
  return response.data;
};

export default api;

