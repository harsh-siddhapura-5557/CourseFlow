import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { SECURE_STORE_KEYS } from "@/constants/storageKeys";
import { logger } from "@/utils/logger";

const BASE_URL = "https://api.freeapi.app/api/v1";

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  retryCount?: number;
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function shouldSkipTokenRefresh(url: string): boolean {
  return (
    url.includes("/users/login") ||
    url.includes("/users/register") ||
    url.includes("/users/refresh-token")
  );
}

/** Never attach Bearer to public auth routes — stale tokens after logout break re-login. */
function shouldOmitAuthHeader(url: string): boolean {
  const path = url.startsWith("http")
    ? (() => {
        try {
          return new URL(url).pathname + new URL(url).search;
        } catch {
          return url;
        }
      })()
    : url;
  return (
    path.includes("/users/login") ||
    path.includes("/users/register") ||
    path.includes("/users/refresh-token")
  );
}

function existingAuthorizationHeader(
  headers: InternalAxiosRequestConfig["headers"],
): string | undefined {
  if (!headers) return undefined;
  const h = headers as Record<string, unknown>;
  const direct =
    (typeof h.Authorization === "string" && h.Authorization) ||
    (typeof h.authorization === "string" && h.authorization);
  if (direct) return direct;
  if (typeof (headers as any).get === "function") {
    const v = (headers as any).get("Authorization") ?? (headers as any).get("authorization");
    if (typeof v === "string" && v) return v;
  }
  return undefined;
}

async function clearStoredSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
  } catch {
    /* already missing */
  }
  try {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
  } catch {
    /* already missing */
  }
  try {
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_DATA);
  } catch {
    /* already missing */
  }
}

/** Avoid static import cycle: api → stores */
async function clearClientSessionState(): Promise<void> {
  try {
    const { useAuthStore } = await import("@/store/useAuthStore");
    const { useCourseStore } = await import("@/store/useCourseStore");
    useAuthStore.setState({ user: null, token: null });
    await useCourseStore.getState().resetStore();
  } catch (e) {
    logger.warn("API", "clearClientSessionState failed", {
      message: (e as Error).message,
    });
  }
}

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const path = config.url || "";
    if (config.headers) {
      if (shouldOmitAuthHeader(path)) {
        delete config.headers.Authorization;
      } else {
        const preset = existingAuthorizationHeader(config.headers);
        if (preset) {
          // Caller set Bearer (e.g. profile fetch before tokens are written to SecureStore).
        } else {
          const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            delete config.headers.Authorization;
          }
        }
      }
    }
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      logger.info("API", `${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    if (!originalRequest) return Promise.reject(error);

    const reqUrl = originalRequest.url || "";

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipTokenRefresh(reqUrl)
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(
          SECURE_STORE_KEYS.REFRESH_TOKEN,
        );
        if (!refreshToken) {
          logger.warn("API", "401 but no refresh token; clearing session");
          await clearStoredSession();
          await clearClientSessionState();
          return Promise.reject(error);
        }

        logger.info("API", "Refreshing access token via body");
        const refreshResponse = await axios.post(
          `${BASE_URL}/users/refresh-token`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 15000,
          },
        );

        const data = refreshResponse.data?.data;
        const accessToken = data?.accessToken;
        const newRefresh = data?.refreshToken;

        if (!accessToken) {
          throw new Error("Refresh response missing accessToken");
        }

        await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, accessToken);
        if (newRefresh) {
          await SecureStore.setItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, newRefresh);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        logger.info("API", "Token refresh OK");
        return api(originalRequest);
      } catch (refreshError: unknown) {
        const re = refreshError as { response?: { status?: number }; message?: string };
        if (re.response?.status === 401) {
          logger.warn("API", "Refresh rejected with 401");
        } else {
          logger.error("API", "Token refresh failed", { message: re.message });
        }
        await clearStoredSession();
        await clearClientSessionState();
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

      logger.warn(
        "API",
        `Retry ${originalRequest.retryCount}/${MAX_RETRIES} after ${backoffDelay}ms`,
        { code: error.code, status: error.response?.status },
      );

      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default api;
export { BASE_URL };
