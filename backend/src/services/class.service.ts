import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { PaginationParams } from "../utils/pagination";
import { CreateClasseInput, UpdateClasseInput } from "../validators/class.validator";

export async function listClasses(
  pagination: PaginationParams,
  search?: string,
  filiereId?: number,
  orderBy: Record<string, "asc" | "desc"> = { nomClasse: "asc" }
) {
  const where = {
    ...(search ? { nomClasse: { contains: search } } : {}),
    ...(filiereId ? { filiereId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.classe.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      include: {
        filiere: true,
        enseignantResponsable: true,
        _count: { select: { etudiants: true } },
      },
      orderBy,
    }),
    prisma.classe.count({ where }),
  ]);

  return { items, total };
}

export async function getClassStats() {
  const classes = await prisma.classe.findMany({ include: { _count: { select: { etudiants: true } } } });
  const totalClasses = classes.length;
  const effectifMoyen = totalClasses
    ? Math.round(classes.reduce((sum, c) => sum + c._count.etudiants, 0) / totalClasses)
    : 0;
  const classesSurchargees = classes.filter((c) => c.effectifMax != null && c._count.etudiants > c.effectifMax).length;
  const filieresActives = await prisma.filiere.count();

  return { totalClasses, effectifMoyen, classesSurchargees, filieresActives };
}

export function createClasse(data: CreateClasseInput) {
  return prisma.classe.create({ data });
}

export async function updateClasse(id: number, data: UpdateClasseInput) {
  await ensureExists(id);
  return prisma.classe.update({ where: { id }, data });
}

export async function deleteClasse(id: number) {
  await ensureExists(id);
  return prisma.classe.delete({ where: { id } });
}

async function ensureExists(id: number) {
  const classe = await prisma.classe.findUnique({ where: { id } });
  if (!classe) throw ApiError.notFound("Classe introuvable");
}
