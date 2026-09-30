import { api } from "./api";

export interface DashboardStats {
  totalEtudiants: number;
  totalEnseignants: number;
  totalClasses: number;
  tauxPresence: number;
  presenceParClasse: { classe: string; taux: number }[];
}

export interface ReportStats {
  tauxPresenceGlobal: number;
  absencesCeMois: number;
  moyenneParClasse: number;
  presenceParMatiere: { matiere: string; taux: number }[];
  presenceParEnseignant: { enseignant: string; taux: number; seances: number }[];
  topAbsences: { id: number; nom: string; classe: string; absencesInjustifiees: number; derniereAbsence: string | null }[];
  evolutionAbsences: { mois: string; count: number }[];
}

export interface MyStats {
  totalSeances: number;
  presents: number;
  absents: number;
  retards: number;
  justifiees: number;
  taux: number;
}

export async function getDashboardStats() {
  const { data } = await api.get<DashboardStats>("/stats/dashboard");
  return data;
}

export async function getReportStats() {
  const { data } = await api.get<ReportStats>("/stats/reports");
  return data;
}

export async function getMyStats() {
  const { data } = await api.get<MyStats>("/stats/me");
  return data;
}
