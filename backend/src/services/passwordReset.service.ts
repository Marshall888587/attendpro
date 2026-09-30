import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";

const TOKEN_TTL_MS = 30 * 60 * 1000;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestReset(identifiant: string) {
  const user = await prisma.utilisateur.findFirst({
    where: { OR: [{ email: identifiant }, { telephone: identifiant }] },
  });

  // Réponse générique dans tous les cas pour éviter l'énumération de comptes.
  if (!user || !user.actif) {
    return { token: null };
  }

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return { token };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw ApiError.badRequest("Lien de réinitialisation invalide ou expiré");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.utilisateur.update({ where: { id: resetToken.userId }, data: { motDePasse: hash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);
}
