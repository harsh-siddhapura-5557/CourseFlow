import * as SecureStore from "expo-secure-store";
import api, { BASE_URL } from "./api";
import { useAuthStore } from "@/store/useAuthStore";
import { useCourseStore } from "@/store/useCourseStore";
import { SECURE_STORE_KEYS } from "@/constants/storageKeys";
import { logger } from "@/utils/logger";
import type { User } from "@/types";

function mimeForUri(uri: string): { name: string; type: string } {
  const filename = uri.split("/").pop() || `avatar-${Date.now()}.jpg`;
  const ext = (filename.split(".").pop() || "jpg").toLowerCase();
  const type =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : "image/jpeg";
  const name = filename.includes(".") ? filename : `upload.${ext === "image/jpeg" ? "jpg" : "png"}`;
  return { name, type };
}

type ApiEnvelope = { data?: unknown; message?: string; statusCode?: number };

/** Clears tokens and in-memory auth only (does not reset course store — use store logout for full sign-out). */
async function clearLocalAuthCredentials(): Promise<void> {
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
  useAuthStore.setState({ user: null, token: null });
}

let activeLoginPromise: Promise<unknown> | null = null;

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, "").trim();
}

/** When PATCH returns empty/non-JSON (proxies, 204), hydrate user from JSON API. */
async function fetchCurrentUserViaApi(): Promise<unknown> {
  const res = await api.get("/users/current-user");
  return res.data?.data;
}

/**
 * Axios + FormData often throws generic "Network Error" on React Native (XHR multipart bug).
 * Native fetch handles multipart uploads reliably.
 */
async function patchAvatarWithFetch(imageUri: string): Promise<unknown> {
  const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
  if (!token) {
    throw new Error("Not authenticated");
  }

  const { name, type } = mimeForUri(imageUri);
  const formData = new FormData();
  formData.append("avatar", {
    uri: imageUri,
    name,
    type,
  } as any);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(`${BASE_URL}/users/avatar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
      signal: controller.signal,
    });

    const raw = await res.text();
    const text = stripBom(raw);

    let body: ApiEnvelope | null = null;
    if (text.length > 0) {
      try {
        body = JSON.parse(text) as ApiEnvelope;
      } catch {
        body = null;
      }
    }

    if (!res.ok) {
      const fallbackPreview = !body && text ? text.slice(0, 200) : "";
      const msg =
        (body && typeof body.message === "string" && body.message) ||
        (fallbackPreview ? `${fallbackPreview}${text.length > 200 ? "…" : ""}` : "") ||
        `Upload failed (HTTP ${res.status})`;
      throw new Error(msg);
    }

    if (body != null && body.data !== undefined && body.data !== null) {
      return body.data;
    }

    logger.warn("Auth", "Avatar PATCH succeeded but body missing JSON user; refetching profile", {
      contentLength: raw.length,
      status: res.status,
    });
    const user = await fetchCurrentUserViaApi();
    if (!user) {
      throw new Error("Avatar may have updated but profile could not be loaded.");
    }
    return user;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const authService = {
  login: async (identifier: string, password: string) => {
    if (activeLoginPromise) {
      return activeLoginPromise;
    }

    activeLoginPromise = (async () => {
      try {
        const isEmail = identifier.includes("@");
        const cleanIdentifier = identifier.toLowerCase().trim();

        await clearLocalAuthCredentials();

        const payload: Record<string, string> = {
          password,
        };

        if (isEmail) {
          payload.email = cleanIdentifier;
          payload.username = cleanIdentifier;
        } else {
          payload.username = cleanIdentifier;
        }

        logger.info("Auth", "Login attempt", { identifier: cleanIdentifier });
        const response = await api.post("/users/login", payload);
        const body = response.data?.data;
        const user = body?.user;
        const accessToken = body?.accessToken;
        const refreshToken = body?.refreshToken as string | undefined;

        if (!accessToken) {
          throw new Error("Login response missing access token");
        }

        // Do not write tokens until profile succeeds — avoids orphaned SecureStore sessions.
        const profileRes = await api.get("/users/current-user", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const latestUser = profileRes.data?.data;
        const sessionUser = latestUser || user;
        if (!sessionUser) {
          throw new Error("Login response missing user profile");
        }

        await useAuthStore
          .getState()
          .login(sessionUser, accessToken, refreshToken ?? undefined);

        await useCourseStore.getState().mergeRemoteProgressAfterLogin();

        logger.info("Auth", "Login success", {
          username: (latestUser || user)?.username,
        });
        return response.data;
      } catch (error: unknown) {
        await clearLocalAuthCredentials();
        const err = error as { response?: { data?: { message?: string } } };
        const errorData = err.response?.data;
        logger.error("Auth", "Login failed", {
          message: errorData?.message || (error as Error).message,
        });
        throw new Error(
          errorData?.message || "Login failed. Please check your credentials.",
        );
      } finally {
        activeLoginPromise = null;
      }
    })();

    return activeLoginPromise;
  },

  fetchProfile: async () => {
    try {
      const response = await api.get("/users/current-user");
      const user = response.data?.data;
      if (user) {
        const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
        const refreshToken = await SecureStore.getItemAsync(
          SECURE_STORE_KEYS.REFRESH_TOKEN,
        );
        if (token) {
          await useAuthStore.getState().login(user, token, refreshToken || undefined);
        }
      }
      return user;
    } catch (error) {
      logger.error("Auth", "Fetch profile failed", { message: (error as Error).message });
      throw error;
    }
  },

  updateAvatar: async (imageUri: string) => {
    const { name, type } = mimeForUri(imageUri);

    try {
      logger.info("Auth", "Avatar upload started (fetch)", { name, type });
      const updatedUser = (await patchAvatarWithFetch(imageUri)) as User | undefined;
      const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
      const refreshToken = await SecureStore.getItemAsync(
        SECURE_STORE_KEYS.REFRESH_TOKEN,
      );
      if (updatedUser?.username && token) {
        await useAuthStore.getState().login(updatedUser, token, refreshToken || undefined);
      }
      logger.info("Auth", "Avatar upload success");
      return updatedUser;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === "AbortError") {
        logger.error("Auth", "Avatar upload timed out");
        throw new Error("Upload timed out. Try a smaller image or check your connection.");
      }
      logger.error("Auth", "Avatar upload failed", {
        message: err.message,
      });
      throw error;
    }
  },

  register: async (data: Record<string, unknown>) => {
    try {
      logger.info("Auth", "Register attempt", { username: data.username });
      const response = await api.post("/users/register", data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      logger.error("Auth", "Register failed", {
        body: err.response?.data,
      });
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      logger.info("Auth", "Change password request");
      await api.post("/users/change-password", {
        oldPassword,
        newPassword,
      });
      logger.info("Auth", "Change password success");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const raw = err.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(", ") : raw;
      logger.error("Auth", "Change password failed", { message: msg });
      throw new Error(msg || "Could not update password. Please try again.");
    }
  },

  logout: async () => {
    const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
    try {
      if (token) {
        await Promise.race([
          api.post("/users/logout"),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("logout-timeout")), 8000),
          ),
        ]);
      }
    } catch (error: unknown) {
      const msg = (error as Error).message;
      if (msg === "logout-timeout") {
        logger.warn("Auth", "Server logout timed out (clearing local session)");
      } else {
        logger.warn("Auth", "Server logout failed (continuing local logout)", {
          message: (error as Error).message,
        });
      }
    } finally {
      await useAuthStore.getState().logout();
    }
  },
};
