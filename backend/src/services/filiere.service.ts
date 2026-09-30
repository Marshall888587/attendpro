import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";

export function listFilieres() {
  return prisma.filiere.findMany({ orderBy: { nomFiliere: "asc" } });
}

export function createFiliere(data: { nomFiliere: string; departement?: string }) {
  return prisma.filiere.create({ data });
}

export async function updateFiliere(id: number, data: Partial<{ nomFiliere: string; departement: string }>) {
  await ensureExists(id);
  return prisma.filiere.update({ where: { id }, data });
}

export async function deleteFiliere(id: number) {
  await ensureExists(id);
  return prisma.filiere.delete({ where: { id } });
}

async function ensureExists(id: number) {
  const filiere = await prisma.filiere.findUnique({ where: { id } });
  if (!filiere) throw ApiError.notFound("Filière introuvable");
}
