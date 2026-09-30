import { api } from "./api";
import { User } from "../types";

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: User }>("/auth/login", { email, password });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function requestPasswordReset(identifiant: string) {
  const { data } = await api.post<{ message: string; token: string | null }>("/auth/forgot-password", { identifiant });
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  await api.post("/auth/reset-password", { token, newPassword });
}
