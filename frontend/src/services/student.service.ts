import { api } from "./api";
import { Etudiant, PaginatedResponse } from "../types";

export interface ListStudentsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  classeId?: number;
  filiereId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function listStudents(params: ListStudentsParams = {}) {
  const { data } = await api.get<PaginatedResponse<Etudiant>>("/students", { params });
  return data;
}

export async function createStudent(payload: Partial<Etudiant> & { motDePasse?: string }) {
  const { data } = await api.post<Etudiant>("/students", payload);
  return data;
}

export async function updateStudent(id: number, payload: Partial<Etudiant>) {
  const { data } = await api.patch<Etudiant>(`/students/${id}`, payload);
  return data;
}

export async function deleteStudent(id: number) {
  await api.delete(`/students/${id}`);
}

export async function resetStudentPassword(id: number) {
  const { data } = await api.patch<{ newPassword: string }>(`/students/${id}/reset-password`);
  return data.newPassword;
}
