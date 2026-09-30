import { api, API_ORIGIN } from "./api";
import { Justificatif, PaginatedResponse } from "../types";

export async function listJustificatifs(params: { page?: number; pageSize?: number; statut?: string } = {}) {
  const { data } = await api.get<PaginatedResponse<Justificatif>>("/justificatifs", { params });
  return data;
}

export async function uploadJustificatifDocument(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string }>("/justificatifs/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export function documentAbsoluteUrl(documentUrl: string) {
  return documentUrl.startsWith("http") ? documentUrl : `${API_ORIGIN}${documentUrl}`;
}

export async function createJustificatif(payload: { presenceId: number; motif: string; documentUrl?: string }) {
  const { data } = await api.post<Justificatif>("/justificatifs", payload);
  return data;
}

export async function treatJustificatif(id: number, statut: "ACCEPTE" | "REFUSE") {
  const { data } = await api.patch<Justificatif>(`/justificatifs/${id}`, { statut });
  return data;
}
