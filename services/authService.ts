import api from "./api";
import { useAuthStore } from "@/store/useAuthStore";
import { useCourseStore } from "@/store/useCourseStore";

export const authService = {
  login: async (identifier: string, password: string) => {
    try {
      const isEmail = identifier.includes("@");
      const payload = isEmail
        ? { email: identifier, password }
        : { username: identifier, password };

      console.log("Logging in with payload:", JSON.stringify(payload, null, 2));
      const response = await api.post("/users/login", payload);
      const { user, accessToken } = response.data.data;
      await useAuthStore.getState().login(user, accessToken);
      return response.data;
    } catch (error: any) {
      console.error(
        "Login Error Response:",
        JSON.stringify(error.response?.data, null, 2),
      );
      throw new Error(error.response?.data?.message || "Login failed");
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
