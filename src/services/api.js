import axios from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Agrega Bearer Token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Response: Manejo de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      router.push({ name: 'login', query: { expired: '1' } });
    }
    return Promise.reject(error);
  }
);

export default api;
