import axios from "axios";
import { clearToken, getToken } from "./tokenStorage";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function resolveFileUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${API_ORIGIN}${url}`;
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
