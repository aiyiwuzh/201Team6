import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Basic demo endpoints
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

// CRUD operations for Items
export interface Item {
  id?: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getAllItems = async (): Promise<Item[]> => {
  const response = await api.get('/items');
  return response.data;
};

export const getItemById = async (id: number): Promise<Item> => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const createItem = async (item: Item): Promise<Item> => {
  const response = await api.post('/items', item);
  return response.data;
};

export const updateItem = async (id: number, item: Item): Promise<Item> => {
  const response = await api.put(`/items/${id}`, item);
  return response.data;
};

export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/items/${id}`);
};

export const deleteAllItems = async (): Promise<void> => {
  await api.delete('/items');
};

export default api;

