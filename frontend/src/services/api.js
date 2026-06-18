import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor để thêm token vào header và xử lý lỗi 401
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('auth-change'));
    }
    return Promise.reject(error);
  }
);

export const loginAPI = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/api/token/`, { username, password });
  return response.data;
};

export const logoutAPI = async (refreshToken) => {
  const token = localStorage.getItem('accessToken');
  return await axios.post(`${API_BASE_URL}/api/logout/`, { refresh_token: refreshToken }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const fetchBooksAPI = async (params) => {
  const response = await api.get('/api/books/', { params });
  return response.data;
};

export const createBookAPI = async (bookData) => {
  const response = await api.post('/api/books/', bookData);
  return response.data;
};

export const updateBookAPI = async (id, bookData) => {
  const response = await api.put(`/api/books/${id}/`, bookData);
  return response.data;
};

export const deleteBookAPI = async (id) => {
  const response = await api.delete(`/api/books/${id}/`);
  return response.data;
};

export default api;
