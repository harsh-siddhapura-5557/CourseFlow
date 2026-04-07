import api from "./api";
import { useAuthStore } from "@/store/useAuthStore";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/users/login", { email, password });
      const { user, accessToken } = response.data.data;
      await useAuthStore.getState().login(user, accessToken);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },
  register: async (data: any) => {
    try {
      const response = await api.post("/users/register", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },
  logout: async () => {
    try {
      await api.post("/users/logout");
      await useAuthStore.getState().logout();
    } catch (error: any) {
      await useAuthStore.getState().logout();
    }
  },
};
