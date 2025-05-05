import axios from 'axios';
import { config } from '../config';
import { TOKEN_KEY } from '../lib/auth';

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;