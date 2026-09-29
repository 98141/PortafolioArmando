import { apiBaseUrl } from "@/src/lib/publicConfig";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

type SessionRequest = InternalAxiosRequestConfig & { _retry?: boolean; _sessionRevision?: number };
let sessionRevision = 0;
let refreshPromise: Promise<void> | null = null;

export function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = api.post("/auth/refresh-token")
      .then(() => { sessionRevision += 1; })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

api.interceptors.request.use((request: SessionRequest) => {
  request._sessionRevision = sessionRevision;
  return request;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as SessionRequest | undefined;
    const privateRequest = /^\/(?:auth\/me(?:$|\?)|admin(?:\/|$))/.test(request?.url || "");
    if (typeof window === "undefined" || error.response?.status !== 401 || !request || request._retry || !privateRequest) {
      throw error;
    }
    request._retry = true;
    try {
      // A late 401 from the old access token can reuse the already refreshed session.
      if (request._sessionRevision === sessionRevision) await refreshSession();
      return await api(request);
    } catch (refreshError) {
      if (axios.isAxiosError(refreshError) && [401, 403].includes(refreshError.response?.status || 0)
        && window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        // A full navigation clears in-memory admin state after session expiry.
        window.location.replace(new URL("/admin/login", window.location.origin).href);
      }
      throw refreshError;
    }
  }
);
