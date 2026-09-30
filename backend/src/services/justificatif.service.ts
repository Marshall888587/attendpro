import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { PaginationParams } from "../utils/pagination";
import { CreateJustificatifInput } from "../validators/justificatif.validator";
import { createNotification, createNotificationForMany } from "./notification.service";

const include = {
  etudiant: { include: { classe: true } },
  presence: { include: { cours: { include: { affectation: { include: { matiere: true } } } } } },
};

export async function listJustificatifs(pagination: PaginationParams, statut?: string, etudiantId?: number) {
  const where = {
    ...(statut ? { statut: statut as "EN_ATTENTE" | "ACCEPTE" | "REFUSE" } : {}),
    ...(etudiantId ? { etudiantId } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.justificatif.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      include,
      orderBy: { dateSoumission: "desc" },
    }),
    prisma.justificatif.count({ where }),
  ]);
  return { items, total };
}

export async function createJustificatif(etudiantId: number, data: CreateJustificatifInput) {
  const presence = await prisma.presence.findUnique({ where: { id: data.presenceId } });
  if (!presence) throw ApiError.notFound("Présence introuvable");
  if (presence.etudiantId !== etudiantId) throw ApiError.forbidden("Cette présence ne vous appartient pas");
  if (presence.statut !== "ABSENT") throw ApiError.badRequest("Un justificatif ne peut être soumis que pour une absence");

  const existing = await prisma.justificatif.findUnique({ where: { presenceId: data.presenceId } });
  if (existing) throw ApiError.conflict("Un justificatif existe déjà pour cette absence");

  const justificatif = await prisma.justificatif.create({
    data: { etudiantId, presenceId: data.presenceId, motif: data.motif, documentUrl: data.documentUrl },
    include,
  });

  const admins = await prisma.utilisateur.findMany({ where: { role: "ADMIN", actif: true }, select: { id: true } });
  await createNotificationForMany(
    admins.map((a) => a.id),
    "JUSTIFICATIF",
    "Nouveau justificatif soumis",
    `${justificatif.etudiant.prenom} ${justificatif.etudiant.nom} a soumis un justificatif d'absence.`,
    "/justificatifs"
  );

  return justificatif;
}

export async function treatJustificatif(id: number, statut: "ACCEPTE" | "REFUSE", traiteParId: number) {
  const justificatif = await prisma.justificatif.findUnique({ where: { id } });
  if (!justificatif) throw ApiError.notFound("Justificatif introuvable");
  if (justificatif.statut !== "EN_ATTENTE") throw ApiError.conflict("Ce justificatif a déjà été traité");

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.justificatif.update({
      where: { id },
      data: { statut, traiteParId, dateTraitement: new Date() },
      include,
    });

    if (statut === "ACCEPTE") {
      await tx.presence.update({
        where: { id: justificatif.presenceId },
        data: { statut: "ABSENCE_JUSTIFIEE" },
      });
    }

    return result;
  });

  const etudiant = await prisma.etudiant.findUnique({ where: { id: updated.etudiantId } });
  if (etudiant?.utilisateurId) {
    await createNotification(
      etudiant.utilisateurId,
      "CHANGEMENT_STATUT",
      statut === "ACCEPTE" ? "Justificatif accepté" : "Justificatif refusé",
      statut === "ACCEPTE"
        ? "Votre justificatif a été accepté, l'absence est désormais justifiée."
        : "Votre justificatif a été refusé.",
      "/justificatifs"
    );
  }

  return updated;
}
