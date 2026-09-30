import { api } from "./api";
import { Affectation, Matiere } from "../types";

export interface SubjectStats {
  totalMatieres: number;
  assocActives: number;
  matieresOrphelines: number;
  couverture: number;
}

export async function listMatieres(search?: string) {
  const { data } = await api.get<Matiere[]>("/subjects", { params: { search } });
  return data;
}

export async function getSubjectStats() {
  const { data } = await api.get<SubjectStats>("/subjects/stats");
  return data;
}

export async function createMatiere(payload: Partial<Matiere>) {
  const { data } = await api.post<Matiere>("/subjects", payload);
  return data;
}

export async function deleteMatiere(id: number) {
  await api.delete(`/subjects/${id}`);
}

export async function createAffectation(payload: { matiereId: number; enseignantId: number; classeId: number }) {
  const { data } = await api.post<Affectation>("/subjects/affectations", payload);
  return data;
}

export async function deleteAffectation(id: number) {
  await api.delete(`/subjects/affectations/${id}`);
}
