import { api } from "./api";
import { Affectation, Cours, EtudiantWithPresence, PaginatedResponse, StatutPresence } from "../types";

export async function listAffectations() {
  const { data } = await api.get<Affectation[]>("/cours/affectations");
  return data;
}

export async function getOrCreateSeance(payload: {
  classeId: number;
  matiereId: number;
  date: string;
  heureDebut: string;
  heureFin?: string;
  salle?: string;
}) {
  const { data } = await api.post<{ cours: Cours; etudiants: EtudiantWithPresence[] }>("/cours/seances", payload);
  return data;
}

export async function saveBulkPresence(coursId: number, presences: { etudiantId: number; statut: StatutPresence }[]) {
  const { data } = await api.post("/presences", { coursId, presences });
  return data;
}

export async function updatePresence(id: number, statut: StatutPresence) {
  const { data } = await api.patch(`/presences/${id}`, { statut });
  return data;
}

export interface HistoryEntry {
  id: number;
  date: string;
  heureDebut: string;
  heureFin?: string | null;
  statut: string;
  classe: { nomClasse: string };
  matiere: { nomMatiere: string };
  enseignant: { nom: string; prenom: string };
  presents: number;
  absents: number;
  retards: number;
  taux: number;
  etudiantStatut?: string | null;
}

export interface HistoryFilters {
  page?: number;
  pageSize?: number;
  classeId?: number;
  matiereId?: number;
  enseignantId?: number;
  etudiantId?: number;
  dateFrom?: string;
  dateTo?: string;
  sortOrder?: "asc" | "desc";
}

export async function listHistory(params: HistoryFilters = {}) {
  const { data } = await api.get<PaginatedResponse<HistoryEntry>>("/presences/history", { params });
  return data;
}

export interface GlobalAttendanceStats {
  tauxPresenceGlobal: number;
  totalAbsences: number;
  totalRetards: number;
  coursAnnules: number;
}

export async function getGlobalStats(dateFrom?: string) {
  const { data } = await api.get<GlobalAttendanceStats>("/presences/stats", { params: { dateFrom } });
  return data;
}
