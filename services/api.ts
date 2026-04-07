import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://api.freeapi.app/api/v1";

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  retryCount?: number;
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log("[API] Attempting token refresh...");
        // Use a clean axios instance for refresh to avoid interceptor loops
        const refreshResponse = await axios.post(
          `${BASE_URL}/users/refresh-token`,
          {},
          {
            withCredentials: true, // Required if cookies are used for refresh tokens
          },
        );
        const { accessToken } = refreshResponse.data.data;

        await SecureStore.setItemAsync("auth_token", accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError: any) {
        if (refreshError.response?.status !== 401) {
          console.error("[API] Token refresh failed:", refreshError.message);
        }

        await SecureStore.deleteItemAsync("auth_token");
        await SecureStore.deleteItemAsync("user_data");

        return Promise.reject(refreshError);
      }
    }

    const shouldRetry =
      (error.code === "ECONNABORTED" ||
        (error.response?.status && error.response.status >= 500)) &&
      (originalRequest.retryCount || 0) < MAX_RETRIES;

    if (shouldRetry) {
      originalRequest.retryCount = (originalRequest.retryCount || 0) + 1;
      const backoffDelay = RETRY_DELAY * originalRequest.retryCount;

      console.warn(
        `[API] Request failed (${error.code || error.response?.status}). Retrying ${originalRequest.retryCount}/${MAX_RETRIES} after ${backoffDelay}ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default api;
