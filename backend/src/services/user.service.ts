import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { PaginationParams } from "../utils/pagination";
import { generateTemporaryPassword } from "../utils/password";
import { requireContact } from "../utils/validators";

export async function listUsers(pagination: PaginationParams, search?: string) {
  const where = search
    ? { OR: [{ nom: { contains: search } }, { prenom: { contains: search } }, { email: { contains: search } }] }
    : {};
  const [items, total] = await Promise.all([
    prisma.utilisateur.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        role: true,
        actif: true,
        createdAt: true,
        etudiant: { select: { id: true } },
        enseignant: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.utilisateur.count({ where }),
  ]);
  const mapped = items.map(({ etudiant, enseignant, ...rest }) => ({
    ...rest,
    hasProfile: Boolean(etudiant || enseignant),
  }));
  return { items: mapped, total };
}

export async function updateUserStatus(
  id: number,
  requesterId: number,
  data: { actif?: boolean; role?: "ADMIN" | "ENSEIGNANT" | "ETUDIANT" }
) {
  const user = await prisma.utilisateur.findUnique({
    where: { id },
    include: { etudiant: { select: { id: true } }, enseignant: { select: { id: true } } },
  });
  if (!user) throw ApiError.notFound("Utilisateur introuvable");
  if (id === requesterId && data.actif === false) {
    throw ApiError.badRequest("Vous ne pouvez pas désactiver votre propre compte.");
  }
  if (data.role && data.role !== user.role && (user.etudiant || user.enseignant)) {
    throw ApiError.badRequest(
      "Le rôle de ce compte est lié à un profil étudiant/enseignant : modifiez-le depuis la page de gestion correspondante."
    );
  }
  const { motDePasse: _omit, etudiant: _e, enseignant: _n, ...safe } = await prisma.utilisateur.update({
    where: { id },
    data,
    include: { etudiant: { select: { id: true } }, enseignant: { select: { id: true } } },
  });
  return { ...safe, hasProfile: Boolean(_e || _n) };
}

export async function createAdminUser(data: { nom: string; prenom: string; email?: string; telephone?: string }) {
  const password = generateTemporaryPassword();
  const hash = await bcrypt.hash(password, 10);
  try {
    const { motDePasse: _omit, ...safe } = await prisma.utilisateur.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        motDePasse: hash,
        role: "ADMIN",
      },
    });
    return { user: safe, password };
  } catch (err: any) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.includes("telephone") ? "Ce numéro de téléphone" : "Cet email";
      throw ApiError.conflict(`${field} est déjà utilisé par un autre compte`);
    }
    throw err;
  }
}

export async function deleteUserAccount(id: number, requesterId: number) {
  if (id === requesterId) {
    throw ApiError.badRequest("Vous ne pouvez pas supprimer votre propre compte.");
  }
  const user = await prisma.utilisateur.findUnique({
    where: { id },
    include: { etudiant: { select: { id: true } }, enseignant: { select: { id: true } } },
  });
  if (!user) throw ApiError.notFound("Utilisateur introuvable");
  if (user.etudiant || user.enseignant) {
    throw ApiError.badRequest(
      "Ce compte est lié à un profil étudiant/enseignant : supprimez-le depuis la page de gestion correspondante."
    );
  }
  try {
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
      prisma.verificationCode.deleteMany({ where: { userId: id } }),
      prisma.utilisateur.delete({ where: { id } }),
    ]);
  } catch (err: any) {
    if (err.code === "P2003") {
      throw ApiError.badRequest(
        "Impossible de supprimer ce compte : il possède des présences ou justificatifs traités. Désactivez-le plutôt."
      );
    }
    throw err;
  }
}

export async function updateProfile(
  id: number,
  data: Partial<{ nom: string; prenom: string; email: string; telephone: string; fonction: string; departement: string; photoUrl: string }>
) {
  const user = await prisma.utilisateur.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("Utilisateur introuvable");

  const normalized = {
    ...data,
    email: data.email === "" ? null : data.email,
    telephone: data.telephone === "" ? null : data.telephone,
  };

  if (!requireContact(normalized, user)) {
    throw ApiError.badRequest("Un email ou un numéro de téléphone est requis");
  }

  try {
    const { motDePasse: _omit, ...safe } = await prisma.utilisateur.update({ where: { id }, data: normalized });
    return safe;
  } catch (err: any) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.includes("telephone") ? "Ce numéro de téléphone" : "Cet email";
      throw ApiError.conflict(`${field} est déjà utilisé par un autre compte`);
    }
    throw err;
  }
}

export async function updatePhoto(id: number, photoUrl: string) {
  const { motDePasse: _omit, ...safe } = await prisma.utilisateur.update({ where: { id }, data: { photoUrl } });
  return safe;
}

export async function changePassword(id: number, currentPassword: string, newPassword: string) {
  const user = await prisma.utilisateur.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("Utilisateur introuvable");
  const valid = await bcrypt.compare(currentPassword, user.motDePasse);
  if (!valid) throw ApiError.badRequest("Mot de passe actuel incorrect");
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.utilisateur.update({ where: { id }, data: { motDePasse: hash } });
}
