import { create } from "zustand";
import { authService } from "@/src/services/authService";
import type { AuthUser } from "@/src/types/auth";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
  clearError: () => void;
}

let sessionCheck: Promise<boolean> | null = null;
let sessionVersion = 0;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    sessionVersion += 1;
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "No se pudo iniciar sesión. Verifica tus credenciales.";
      set({ error: message, isLoading: false, isAuthenticated: false, user: null });
      throw err;
    }
  },

  logout: async () => {
    sessionVersion += 1;
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({ isLoading: false, error: "No se pudo confirmar el cierre de sesión. Inténtalo de nuevo." });
      throw error;
    }
  },

  checkSession: () => {
    if (sessionCheck) return sessionCheck;
    const version = sessionVersion;
    set({ isLoading: true });
    sessionCheck = (async () => {
      try {
        const user = await authService.getMe();
        if (version !== sessionVersion) return false;
        set({ user, isAuthenticated: true, isLoading: false, isInitialized: true, error: null });
        return true;
      } catch {
        if (version !== sessionVersion) return false;
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
        return false;
      }
    })().finally(() => { sessionCheck = null; });
    return sessionCheck;
  },
}));
