import api from "./api";
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

      await useAuthStore.getState().login(user, accessToken);
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data;
      console.error("[Auth] Login Error:", JSON.stringify(errorData, null, 2));
      throw new Error(
        errorData?.message || "Login failed. Please check your credentials.",
      );
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
