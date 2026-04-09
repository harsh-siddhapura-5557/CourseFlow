import api from "./api";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/store/useAuthStore";
import { useCourseStore } from "@/store/useCourseStore";

export const authService = {
  login: async (identifier: string, password: string) => {
    try {
      const isEmail = identifier.includes("@");
      const cleanIdentifier = identifier.toLowerCase().trim();

      const payload: any = {
        password: password,
      };

      if (isEmail) {
        payload.email = cleanIdentifier;
        payload.username = cleanIdentifier; // Try sending email in username field too
      } else {
        payload.username = cleanIdentifier;
      }

      console.log("[Auth] Login attempt for:", cleanIdentifier);
      const response = await api.post("/users/login", payload);
      const { user, accessToken } = response.data.data;

      // After login, fetch the latest profile to ensure we have any previous avatar
      const profileRes = await api.get("/users/current-user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const latestUser = profileRes.data.data;

      await useAuthStore.getState().login(latestUser || user, accessToken);
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data;
      console.error("[Auth] Login Error:", JSON.stringify(errorData, null, 2));
      throw new Error(
        errorData?.message || "Login failed. Please check your credentials.",
      );
    }
  },
  fetchProfile: async () => {
    try {
      const response = await api.get("/users/current-user");
      const user = response.data.data;
      if (user) {
        const { login } = useAuthStore.getState();
        const token = await SecureStore.getItemAsync("auth_token");
        if (token) {
          await login(user, token);
        }
      }
      return user;
    } catch (error) {
      console.error("[Auth] Fetch Profile Error:", error);
      throw error;
    }
  },
  updateAvatar: async (imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("avatar", {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await api.patch("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.data;
      const { user } = useAuthStore.getState();
      if (user && updatedUser) {
        await useAuthStore
          .getState()
          .login(
            updatedUser,
            (await SecureStore.getItemAsync("auth_token")) || "",
          );
      }
      return updatedUser;
    } catch (error: any) {
      console.error(
        "[Auth] Avatar Upload Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },
  register: async (data: any) => {
    try {
      console.log("Registering with data:", JSON.stringify(data, null, 2));
      const response = await api.post("/users/register", data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Registration Error Response:",
        JSON.stringify(error.response?.data, null, 2),
      );
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },
  logout: async () => {
    try {
      await api.post("/users/logout");
      await useAuthStore.getState().logout();
      await useCourseStore.getState().resetStore();
    } catch (error: any) {
      await useAuthStore.getState().logout();
      await useCourseStore.getState().resetStore();
    }
  },
};
