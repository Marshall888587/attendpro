import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { CreateAffectationInput, CreateMatiereInput } from "../validators/subject.validator";

export async function listMatieres(search?: string) {
  return prisma.matiere.findMany({
    where: search
      ? { OR: [{ nomMatiere: { contains: search } }, { code: { contains: search } }] }
      : undefined,
    include: { affectations: { include: { enseignant: true, classe: true } } },
    orderBy: { nomMatiere: "asc" },
  });
}

export async function getSubjectStats() {
  const [totalMatieres, assocActives, matieresAvecAffectation] = await Promise.all([
    prisma.matiere.count(),
    prisma.affectation.count(),
    prisma.matiere.findMany({ select: { id: true, _count: { select: { affectations: true } } } }),
  ]);
  const matieresOrphelines = matieresAvecAffectation.filter((m) => m._count.affectations === 0).length;
  const couverture = totalMatieres ? Math.round(((totalMatieres - matieresOrphelines) / totalMatieres) * 100) : 0;

  return { totalMatieres, assocActives, matieresOrphelines, couverture };
}

export async function createMatiere(data: CreateMatiereInput) {
  const existing = await prisma.matiere.findUnique({ where: { code: data.code } });
  if (existing) throw ApiError.conflict("Ce code matière existe déjà");
  return prisma.matiere.create({ data });
}

export async function updateMatiere(id: number, data: Partial<CreateMatiereInput>) {
  const matiere = await prisma.matiere.findUnique({ where: { id } });
  if (!matiere) throw ApiError.notFound("Matière introuvable");
  return prisma.matiere.update({ where: { id }, data });
}

export async function deleteMatiere(id: number) {
  const matiere = await prisma.matiere.findUnique({ where: { id } });
  if (!matiere) throw ApiError.notFound("Matière introuvable");
  await prisma.matiere.delete({ where: { id } });
}

export async function createAffectation(data: CreateAffectationInput) {
  const existing = await prisma.affectation.findUnique({
    where: { matiereId_classeId: { matiereId: data.matiereId, classeId: data.classeId } },
  });
  if (existing) throw ApiError.conflict("Cette matière est déjà associée à cette classe");

  return prisma.affectation.create({
    data,
    include: { matiere: true, enseignant: true, classe: true },
  });
}

export async function deleteAffectation(id: number) {
  const affectation = await prisma.affectation.findUnique({ where: { id } });
  if (!affectation) throw ApiError.notFound("Association introuvable");
  await prisma.affectation.delete({ where: { id } });
}
