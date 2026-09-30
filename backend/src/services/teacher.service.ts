import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { PaginationParams } from "../utils/pagination";
import { generateTemporaryPassword } from "../utils/password";
import { requireContact } from "../utils/validators";
import { generateTeacherMatricule } from "../utils/matricule";
import { createNotification } from "./notification.service";
import { CreateTeacherInput, UpdateTeacherInput } from "../validators/teacher.validator";

const teacherInclude = {
  affectations: { include: { matiere: true, classe: true } },
};

export async function listTeachers(
  pagination: PaginationParams,
  search?: string,
  orderBy: Record<string, "asc" | "desc"> = { nom: "asc" }
) {
  const where = search
    ? {
        OR: [
          { nom: { contains: search } },
          { prenom: { contains: search } },
          { email: { contains: search } },
          { specialite: { contains: search } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.enseignant.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      include: teacherInclude,
      orderBy,
    }),
    prisma.enseignant.count({ where }),
  ]);

  return { items, total };
}

export function getTeacherStats() {
  return Promise.all([
    prisma.enseignant.count({ where: { statut: "ACTIF" } }),
    prisma.affectation.count(),
  ]).then(([totalActifs, affectationsActives]) => ({ totalActifs, affectationsActives }));
}

export async function createTeacher(data: CreateTeacherInput) {
  const matriculeEns = await generateTeacherMatricule();

  let newUserId: number | undefined;

  try {
    const teacher = await prisma.$transaction(async (tx) => {
      const hash = await bcrypt.hash(data.motDePasse ?? "attendpro123", 10);
      const user = await tx.utilisateur.create({
        data: {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          motDePasse: hash,
          role: "ENSEIGNANT",
        },
      });
      newUserId = user.id;

      return tx.enseignant.create({
        data: {
          matriculeEns,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          specialite: data.specialite,
          utilisateurId: user.id,
        },
        include: teacherInclude,
      });
    });

    await createNotification(
      newUserId!,
      "NOUVEAU_COMPTE",
      "Bienvenue sur ATTENDPRO",
      "Votre compte enseignant a été créé.",
      "/parametres"
    );

    return teacher;
  } catch (err: any) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.includes("telephone") ? "Ce numéro de téléphone" : "Cet email";
      throw ApiError.conflict(`${field} est déjà utilisé par un autre compte`);
    }
    throw err;
  }
}

export async function updateTeacher(id: number, data: UpdateTeacherInput) {
  const teacher = await prisma.enseignant.findUnique({ where: { id } });
  if (!teacher) throw ApiError.notFound("Enseignant introuvable");

  const normalized = {
    ...data,
    email: data.email === "" ? null : data.email,
    telephone: data.telephone === "" ? null : data.telephone,
  };
  if (!requireContact(normalized, teacher)) {
    throw ApiError.badRequest("Un email ou un numéro de téléphone est requis");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      if (teacher.utilisateurId && (data.nom || data.prenom || "email" in data || "telephone" in data)) {
        await tx.utilisateur.update({
          where: { id: teacher.utilisateurId },
          data: { nom: data.nom, prenom: data.prenom, email: normalized.email, telephone: normalized.telephone },
        });
      }

      const updated = await tx.enseignant.update({
        where: { id },
        data: {
          nom: data.nom,
          prenom: data.prenom,
          email: normalized.email,
          telephone: normalized.telephone,
          specialite: data.specialite,
          statut: data.statut,
        },
        include: teacherInclude,
      });

      if (teacher.utilisateurId && data.statut && data.statut !== teacher.statut) {
        await createNotification(
          teacher.utilisateurId,
          "CHANGEMENT_STATUT",
          "Statut du compte modifié",
          `Votre statut est désormais : ${data.statut === "ACTIF" ? "Actif" : "En congé"}.`,
          "/parametres"
        );
      }

      return updated;
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.includes("telephone") ? "Ce numéro de téléphone" : "Cet email";
      throw ApiError.conflict(`${field} est déjà utilisé par un autre compte`);
    }
    throw err;
  }
}

export async function deleteTeacher(id: number) {
  const teacher = await prisma.enseignant.findUnique({ where: { id } });
  if (!teacher) throw ApiError.notFound("Enseignant introuvable");
  await prisma.enseignant.delete({ where: { id } });

  if (teacher.utilisateurId) {
    try {
      await prisma.$transaction([
        prisma.notification.deleteMany({ where: { userId: teacher.utilisateurId } }),
        prisma.passwordResetToken.deleteMany({ where: { userId: teacher.utilisateurId } }),
        prisma.verificationCode.deleteMany({ where: { userId: teacher.utilisateurId } }),
        prisma.utilisateur.delete({ where: { id: teacher.utilisateurId } }),
      ]);
    } catch {
      // Compte lié à des données historiques (présences enregistrées, etc.) : on le désactive au lieu de le supprimer.
      await prisma.utilisateur.update({ where: { id: teacher.utilisateurId }, data: { actif: false } }).catch(() => {});
    }
  }
}

export async function resetTeacherPassword(id: number) {
  const teacher = await prisma.enseignant.findUnique({ where: { id } });
  if (!teacher) throw ApiError.notFound("Enseignant introuvable");
  if (!teacher.utilisateurId) throw ApiError.badRequest("Cet enseignant n'a pas de compte de connexion.");

  const newPassword = generateTemporaryPassword();
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.utilisateur.update({ where: { id: teacher.utilisateurId }, data: { motDePasse: hash } });
  return { newPassword };
}
