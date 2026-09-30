import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { PaginationParams } from "../utils/pagination";
import { SaveBulkPresenceInput } from "../validators/presence.validator";
import { createNotification } from "./notification.service";

async function notifyPresenceStatut(etudiantId: number, statut: string) {
  if (statut !== "ABSENT" && statut !== "RETARD") return;
  const etudiant = await prisma.etudiant.findUnique({ where: { id: etudiantId } });
  if (!etudiant?.utilisateurId) return;
  const label = statut === "ABSENT" ? "absent(e)" : "en retard";
  await createNotification(
    etudiant.utilisateurId,
    statut === "ABSENT" ? "ABSENCE" : "RETARD",
    statut === "ABSENT" ? "Absence enregistrée" : "Retard enregistré",
    `Vous avez été marqué(e) ${label} à une séance.`,
    "/historique"
  );
}

export async function saveBulkPresence(input: SaveBulkPresenceInput, enregistreParId: number) {
  const cours = await prisma.cours.findUnique({ where: { id: input.coursId } });
  if (!cours) throw ApiError.notFound("Séance introuvable");

  await prisma.$transaction([
    ...input.presences.map((p) =>
      prisma.presence.upsert({
        where: { etudiantId_coursId: { etudiantId: p.etudiantId, coursId: input.coursId } },
        create: { etudiantId: p.etudiantId, coursId: input.coursId, statut: p.statut, enregistreParId },
        update: { statut: p.statut, enregistreParId, heureEnregistrement: new Date() },
      })
    ),
    prisma.cours.update({ where: { id: input.coursId }, data: { statut: "REALISE" } }),
  ]);

  await Promise.all(input.presences.map((p) => notifyPresenceStatut(p.etudiantId, p.statut)));

  return prisma.presence.findMany({ where: { coursId: input.coursId }, include: { etudiant: true } });
}

export async function updatePresence(id: number, statut: "PRESENT" | "ABSENT" | "RETARD" | "ABSENCE_JUSTIFIEE", enregistreParId: number) {
  const presence = await prisma.presence.findUnique({ where: { id } });
  if (!presence) throw ApiError.notFound("Présence introuvable");
  const updated = await prisma.presence.update({
    where: { id },
    data: { statut, enregistreParId, heureEnregistrement: new Date() },
  });
  await notifyPresenceStatut(presence.etudiantId, statut);
  return updated;
}

interface HistoryFilters {
  classeId?: number;
  matiereId?: number;
  enseignantId?: number;
  etudiantId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export async function listHistory(
  pagination: PaginationParams,
  filters: HistoryFilters,
  dateOrder: "asc" | "desc" = "desc"
) {
  const affectationFilter = {
    ...(filters.classeId ? { classeId: filters.classeId } : {}),
    ...(filters.matiereId ? { matiereId: filters.matiereId } : {}),
    ...(filters.enseignantId ? { enseignantId: filters.enseignantId } : {}),
  };

  const where = {
    ...(Object.keys(affectationFilter).length ? { affectation: affectationFilter } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? { date: { gte: filters.dateFrom, lte: filters.dateTo } }
      : {}),
    ...(filters.etudiantId ? { presences: { some: { etudiantId: filters.etudiantId } } } : {}),
  };

  const [seances, total] = await Promise.all([
    prisma.cours.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      include: {
        affectation: { include: { classe: true, matiere: true, enseignant: true } },
        presences: true,
      },
      orderBy: { date: dateOrder },
    }),
    prisma.cours.count({ where }),
  ]);

  const data = seances.map((s) => {
    const presents = s.presences.filter((p) => p.statut === "PRESENT").length;
    const absents = s.presences.filter((p) => p.statut === "ABSENT").length;
    const retards = s.presences.filter((p) => p.statut === "RETARD").length;
    const total = s.presences.length;
    const etudiantStatut = filters.etudiantId
      ? s.presences.find((p) => p.etudiantId === filters.etudiantId)?.statut ?? null
      : undefined;
    return {
      id: s.id,
      date: s.date,
      heureDebut: s.heureDebut,
      heureFin: s.heureFin,
      statut: s.statut,
      classe: s.affectation.classe,
      matiere: s.affectation.matiere,
      enseignant: s.affectation.enseignant,
      presents,
      absents,
      retards,
      taux: total ? Math.round((presents / total) * 1000) / 10 : 0,
      etudiantStatut,
    };
  });

  return { data, total };
}

export async function getGlobalAttendanceStats(dateFrom?: Date) {
  const where = dateFrom ? { date: { gte: dateFrom } } : {};
  const [presences, coursAnnules] = await Promise.all([
    prisma.presence.findMany({ where: { cours: where }, select: { statut: true } }),
    prisma.cours.count({ where: { ...where, statut: "ANNULE" } }),
  ]);

  const total = presences.length;
  const presents = presences.filter((p) => p.statut === "PRESENT").length;
  const absents = presences.filter((p) => p.statut === "ABSENT").length;
  const retards = presences.filter((p) => p.statut === "RETARD").length;
  const tauxPresenceGlobal = total ? Math.round((presents / total) * 1000) / 10 : 0;

  return { tauxPresenceGlobal, totalAbsences: absents, totalRetards: retards, coursAnnules };
}
