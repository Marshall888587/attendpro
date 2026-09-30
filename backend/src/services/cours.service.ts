import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { CreateSeanceInput } from "../validators/cours.validator";
import { createNotificationForMany } from "./notification.service";

export async function listAffectations(enseignantId?: number) {
  return prisma.affectation.findMany({
    where: enseignantId ? { enseignantId } : undefined,
    include: { matiere: true, classe: true, enseignant: true },
    orderBy: { classe: { nomClasse: "asc" } },
  });
}

export async function getOrCreateSeance(input: CreateSeanceInput, requestingEnseignantId?: number) {
  const affectation = await prisma.affectation.findUnique({
    where: { matiereId_classeId: { matiereId: input.matiereId, classeId: input.classeId } },
  });
  if (!affectation) {
    throw ApiError.badRequest("Aucun enseignant n'est associé à cette matière pour cette classe");
  }
  if (requestingEnseignantId && affectation.enseignantId !== requestingEnseignantId) {
    throw ApiError.forbidden("Vous n'êtes pas assigné à cette matière pour cette classe");
  }

  const existing = await prisma.cours.findFirst({
    where: { affectationId: affectation.id, date: input.date, heureDebut: input.heureDebut },
  });
  if (existing) {
    if (input.salle && input.salle !== existing.salle) {
      return prisma.cours.update({ where: { id: existing.id }, data: { salle: input.salle } });
    }
    return existing;
  }

  return prisma.cours.create({
    data: {
      affectationId: affectation.id,
      date: input.date,
      heureDebut: input.heureDebut,
      heureFin: input.heureFin,
      salle: input.salle,
    },
  });
}

export async function getSeanceWithStudents(coursId: number) {
  const cours = await prisma.cours.findUnique({
    where: { id: coursId },
    include: { affectation: { include: { matiere: true, classe: true, enseignant: true } }, presences: true },
  });
  if (!cours) throw ApiError.notFound("Séance introuvable");

  const etudiants = await prisma.etudiant.findMany({
    where: { classeId: cours.affectation.classeId, statut: "ACTIF" },
    orderBy: { nom: "asc" },
  });

  const presenceByEtudiant = new Map(cours.presences.map((p) => [p.etudiantId, p]));

  return {
    cours,
    etudiants: etudiants.map((e) => ({
      ...e,
      presence: presenceByEtudiant.get(e.id) ?? null,
    })),
  };
}

export async function updateCoursStatut(id: number, statut: "PLANIFIE" | "REALISE" | "ANNULE") {
  const cours = await prisma.cours.findUnique({
    where: { id },
    include: { affectation: { include: { classe: true, matiere: true } } },
  });
  if (!cours) throw ApiError.notFound("Séance introuvable");
  const updated = await prisma.cours.update({ where: { id }, data: { statut } });

  if (statut === "ANNULE") {
    const etudiants = await prisma.etudiant.findMany({
      where: { classeId: cours.affectation.classeId, utilisateurId: { not: null } },
      select: { utilisateurId: true },
    });
    await createNotificationForMany(
      etudiants.map((e) => e.utilisateurId!).filter(Boolean),
      "PLANNING_MODIFIE",
      "Séance annulée",
      `La séance de ${cours.affectation.matiere.nomMatiere} du ${cours.date.toLocaleDateString("fr-FR")} a été annulée.`,
      "/historique"
    );
  }

  return updated;
}
