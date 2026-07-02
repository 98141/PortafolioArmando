import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const shouldSkipRefresh = (url?: string) => {
  if (!url) return true;
  return (
    url.includes("/admin/uploads") ||
    url.includes("/auth/login") ||
    url.includes("/auth/register-admin") ||
    url.includes("/auth/refresh-token") ||
    url.includes("/auth/logout")
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = api
        .post("/auth/refresh-token")
        .then(() => undefined)
        .catch((refreshError) => {
          if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
            window.location.href = "/admin/login";
          }
          return Promise.reject(refreshError);
        })
        .finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);
