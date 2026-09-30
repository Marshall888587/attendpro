import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { PaginationParams } from "../utils/pagination";
import { generateTemporaryPassword } from "../utils/password";
import { requireContact } from "../utils/validators";
import { generateStudentMatricule } from "../utils/matricule";
import { createNotification } from "./notification.service";
import { CreateStudentInput, UpdateStudentInput } from "../validators/student.validator";

const studentInclude = { classe: { include: { filiere: true } } };

export async function listStudents(
  pagination: PaginationParams,
  search?: string,
  classeId?: number,
  filiereId?: number,
  orderBy: Record<string, "asc" | "desc"> = { nom: "asc" }
) {
  const where = {
    ...(search
      ? {
          OR: [
            { nom: { contains: search } },
            { prenom: { contains: search } },
            { matricule: { contains: search } },
          ],
        }
      : {}),
    ...(classeId ? { classeId } : {}),
    ...(filiereId ? { classe: { filiereId } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.etudiant.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      include: studentInclude,
      orderBy,
    }),
    prisma.etudiant.count({ where }),
  ]);

  return { items, total };
}

export function getStudent(id: number) {
  return prisma.etudiant.findUniqueOrThrow({ where: { id }, include: studentInclude }).catch(() => {
    throw ApiError.notFound("Étudiant introuvable");
  });
}

export async function createStudent(data: CreateStudentInput) {
  const matricule = await generateStudentMatricule();

  let newUserId: number | undefined;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let utilisateurId: number | undefined;
      if (data.email || data.telephone) {
        const hash = await bcrypt.hash(data.motDePasse ?? "attendpro123", 10);
        const user = await tx.utilisateur.create({
          data: {
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: data.telephone,
            motDePasse: hash,
            role: "ETUDIANT",
          },
        });
        utilisateurId = user.id;
        newUserId = user.id;
      }

      return tx.etudiant.create({
        data: {
          matricule,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          dateNaissance: data.dateNaissance,
          sexe: data.sexe,
          classeId: data.classeId,
          utilisateurId,
        },
        include: studentInclude,
      });
    });

    if (newUserId) {
      await createNotification(
        newUserId,
        "NOUVEAU_COMPTE",
        "Bienvenue sur ATTENDPRO",
        "Votre compte étudiant a été créé.",
        "/parametres"
      );
    }

    return result;
  } catch (err: any) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.includes("telephone") ? "Ce numéro de téléphone" : "Cet email";
      throw ApiError.conflict(`${field} est déjà utilisé par un autre compte`);
    }
    throw err;
  }
}

export async function updateStudent(id: number, data: UpdateStudentInput) {
  const student = await prisma.etudiant.findUnique({ where: { id } });
  if (!student) throw ApiError.notFound("Étudiant introuvable");

  const normalized = {
    ...data,
    email: data.email === "" ? null : data.email,
    telephone: data.telephone === "" ? null : data.telephone,
  };
  if (student.utilisateurId && !requireContact(normalized, student)) {
    throw ApiError.badRequest("Un email ou un numéro de téléphone est requis");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      if (student.utilisateurId && (data.nom || data.prenom || "email" in data || "telephone" in data || data.statut)) {
        await tx.utilisateur.update({
          where: { id: student.utilisateurId },
          data: {
            nom: data.nom,
            prenom: data.prenom,
            email: normalized.email,
            telephone: normalized.telephone,
            ...(data.statut ? { actif: data.statut === "ACTIF" } : {}),
          },
        });
      }

      const updated = await tx.etudiant.update({
        where: { id },
        data: {
          nom: data.nom,
          prenom: data.prenom,
          email: normalized.email,
          telephone: normalized.telephone,
          dateNaissance: data.dateNaissance,
          sexe: data.sexe,
          classeId: data.classeId,
          statut: data.statut,
        },
        include: studentInclude,
      });

      if (student.utilisateurId && data.statut && data.statut !== student.statut) {
        await createNotification(
          student.utilisateurId,
          "CHANGEMENT_STATUT",
          "Statut du compte modifié",
          `Votre statut est désormais : ${data.statut === "ACTIF" ? "Actif" : "Inactif"}.`,
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

export async function deleteStudent(id: number) {
  const student = await prisma.etudiant.findUnique({ where: { id } });
  if (!student) throw ApiError.notFound("Étudiant introuvable");
  await prisma.etudiant.delete({ where: { id } });

  if (student.utilisateurId) {
    try {
      await prisma.$transaction([
        prisma.notification.deleteMany({ where: { userId: student.utilisateurId } }),
        prisma.passwordResetToken.deleteMany({ where: { userId: student.utilisateurId } }),
        prisma.verificationCode.deleteMany({ where: { userId: student.utilisateurId } }),
        prisma.utilisateur.delete({ where: { id: student.utilisateurId } }),
      ]);
    } catch {
      // Compte lié à des données historiques (justificatifs traités, etc.) : on le désactive au lieu de le supprimer.
      await prisma.utilisateur.update({ where: { id: student.utilisateurId }, data: { actif: false } }).catch(() => {});
    }
  }
}

export async function resetStudentPassword(id: number) {
  const student = await prisma.etudiant.findUnique({ where: { id } });
  if (!student) throw ApiError.notFound("Étudiant introuvable");
  if (!student.utilisateurId) throw ApiError.badRequest("Cet étudiant n'a pas de compte de connexion (aucun email renseigné).");

  const newPassword = generateTemporaryPassword();
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.utilisateur.update({ where: { id: student.utilisateurId }, data: { motDePasse: hash } });
  return { newPassword };
}
