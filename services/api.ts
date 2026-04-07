import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://api.freeapi.app/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Simple retry mechanism
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry logic
    if (!config || !config.retry) {
        config.retry = 0;
    }

    if (config.retry < MAX_RETRIES && (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
        config.retry += 1;
        const delay = new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * config.retry));
        return delay.then(() => api(config));
    }

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Handle unauthorized (e.g., logout)
    }
    return Promise.reject(error);
  }
);

export default api;
