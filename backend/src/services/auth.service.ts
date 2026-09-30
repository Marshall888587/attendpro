import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { LoginInput } from "../validators/auth.validator";

export async function login({ email: identifiant, password }: LoginInput) {
  const user = await prisma.utilisateur.findFirst({
    where: { OR: [{ email: identifiant }, { telephone: identifiant }] },
    include: { etudiant: true, enseignant: true },
  });

  if (!user || !user.actif) {
    throw ApiError.unauthorized("Identifiants incorrects");
  }

  const valid = await bcrypt.compare(password, user.motDePasse);
  if (!valid) {
    throw ApiError.unauthorized("Identifiants incorrects");
  }

  const token = signToken({ userId: user.id, role: user.role });

  const { motDePasse: _omit, ...safeUser } = user;
  return { token, user: safeUser };
}

export async function getCurrentUser(userId: number) {
  const user = await prisma.utilisateur.findUnique({
    where: { id: userId },
    include: {
      etudiant: { include: { classe: true } },
      enseignant: true,
    },
  });
  if (!user) throw ApiError.notFound("Utilisateur introuvable");
  const { motDePasse: _omit, ...safeUser } = user;
  return safeUser;
}
