import { api } from "./api";
import { Classe, Filiere, PaginatedResponse } from "../types";

export interface ClassStats {
  totalClasses: number;
  effectifMoyen: number;
  classesSurchargees: number;
  filieresActives: number;
}

export async function listClasses(
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    filiereId?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
) {
  const { data } = await api.get<PaginatedResponse<Classe>>("/classes", { params });
  return data;
}

export async function getClassStats() {
  const { data } = await api.get<ClassStats>("/classes/stats");
  return data;
}

export async function createClasse(payload: Partial<Classe>) {
  const { data } = await api.post<Classe>("/classes", payload);
  return data;
}

export async function updateClasse(id: number, payload: Partial<Classe>) {
  const { data } = await api.patch<Classe>(`/classes/${id}`, payload);
  return data;
}

export async function deleteClasse(id: number) {
  await api.delete(`/classes/${id}`);
}

export async function listFilieres() {
  const { data } = await api.get<Filiere[]>("/filieres");
  return data;
}

export async function createFiliere(payload: Partial<Filiere>) {
  const { data } = await api.post<Filiere>("/filieres", payload);
  return data;
}

export async function updateFiliere(id: number, payload: Partial<Filiere>) {
  const { data } = await api.patch<Filiere>(`/filieres/${id}`, payload);
  return data;
}

export async function deleteFiliere(id: number) {
  await api.delete(`/filieres/${id}`);
}
