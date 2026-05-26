import { api } from "@/src/services/api";
import type { AuthResponse, MeResponse } from "@/src/types/auth";

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    return data.data.user;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async getMe() {
    const { data } = await api.get<MeResponse>("/auth/me");
    return data.data.user;
  },

  async refreshToken() {
    await api.post("/auth/refresh-token");
  },
};
