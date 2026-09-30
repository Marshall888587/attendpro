import { api } from "./api";
import { PaginatedResponse, User, UserAccount } from "../types";

export async function updateProfile(payload: Partial<User>) {
  const { data } = await api.patch<User>("/users/me/profile", payload);
  return data;
}

export async function uploadPhoto(file: File) {
  const form = new FormData();
  form.append("photo", file);
  const { data } = await api.post<User>("/users/me/photo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await api.post("/users/me/change-password", { currentPassword, newPassword });
}

export async function requestPasswordCode() {
  const { data } = await api.post<{ message: string; code: string }>("/users/me/password-code");
  return data;
}

export async function changePasswordWithCode(code: string, newPassword: string) {
  await api.post("/users/me/change-password-with-code", { code, newPassword });
}

export async function listAccounts(params: { page?: number; pageSize?: number; search?: string } = {}) {
  const { data } = await api.get<PaginatedResponse<UserAccount>>("/users", { params });
  return data;
}

export async function createAdminAccount(payload: { nom: string; prenom: string; email?: string; telephone?: string }) {
  const { data } = await api.post<{ user: UserAccount; password: string }>("/users", payload);
  return data;
}

export async function updateAccountStatus(id: number, payload: { actif?: boolean; role?: string }) {
  const { data } = await api.patch<UserAccount>(`/users/${id}/status`, payload);
  return data;
}

export async function deleteAccount(id: number) {
  await api.delete(`/users/${id}`);
}
