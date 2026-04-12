import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { AuthState, User } from "@/types";
import api from "@/services/api";
import { SECURE_STORE_KEYS } from "@/constants/storageKeys";
import { logger } from "@/utils/logger";
import { useCourseStore } from "@/store/useCourseStore";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isInitialized: false,

  login: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.USER_DATA, JSON.stringify(user));
    set({ user, token: accessToken });
    logger.info("AuthStore", "Session persisted to SecureStore", {
      userId: user?.id,
      hasRefresh: Boolean(refreshToken),
    });
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
    } catch {
      /* */
    }
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
    } catch {
      /* */
    }
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_DATA);
    } catch {
      /* */
    }
    set({ user: null, token: null });
    await useCourseStore.getState().resetStore();
    logger.info("AuthStore", "Local session and course cache cleared");
  },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
      if (token) {
        const response = await api.get("/users/current-user");
        const user = response.data?.data;
        if (user) {
          await SecureStore.setItemAsync(
            SECURE_STORE_KEYS.USER_DATA,
            JSON.stringify(user),
          );
          set({ token, user, isInitialized: true });
          logger.info("AuthStore", "checkAuth: profile hydrated from API");
          return;
        }
      }

      const userData = await SecureStore.getItemAsync(SECURE_STORE_KEYS.USER_DATA);
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isInitialized: true });
        logger.warn("AuthStore", "checkAuth: using cached user (API returned empty)");
      } else {
        set({ isInitialized: true });
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      logger.error("AuthStore", "checkAuth error", {
        message: err.message,
        status: err.response?.status,
      });

      if (err.response?.status === 401) {
        await get().logout();
        set({ isInitialized: true });
        return;
      }

      const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
      const userData = await SecureStore.getItemAsync(SECURE_STORE_KEYS.USER_DATA);
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isInitialized: true });
        logger.warn("AuthStore", "checkAuth: offline or API error; using cached user");
      } else {
        set({ isInitialized: true });
      }
    }
  },
}));
