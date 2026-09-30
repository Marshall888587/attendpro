import { api } from "./api";
import { Enseignant, PaginatedResponse } from "../types";

export async function listTeachers(
  params: { page?: number; pageSize?: number; search?: string; sortBy?: string; sortOrder?: "asc" | "desc" } = {}
) {
  const { data } = await api.get<PaginatedResponse<Enseignant>>("/teachers", { params });
  return data;
}

export async function getTeacherStats() {
  const { data } = await api.get<{ totalActifs: number; affectationsActives: number }>("/teachers/stats");
  return data;
}

export async function createTeacher(payload: Partial<Enseignant> & { motDePasse?: string }) {
  const { data } = await api.post<Enseignant>("/teachers", payload);
  return data;
}

export async function updateTeacher(id: number, payload: Partial<Enseignant>) {
  const { data } = await api.patch<Enseignant>(`/teachers/${id}`, payload);
  return data;
}

export async function deleteTeacher(id: number) {
  await api.delete(`/teachers/${id}`);
}

export async function resetTeacherPassword(id: number) {
  const { data } = await api.patch<{ newPassword: string }>(`/teachers/${id}/reset-password`);
  return data.newPassword;
}
