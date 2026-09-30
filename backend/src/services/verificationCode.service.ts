import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";

const CODE_TTL_MS = 10 * 60 * 1000;

function hashCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function requestCode(userId: number) {
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("Utilisateur introuvable");
  if (!user.email && !user.telephone) {
    throw ApiError.badRequest("Aucun email ou numéro de téléphone n'est associé à ce compte.");
  }

  await prisma.verificationCode.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const code = generateCode();
  await prisma.verificationCode.create({
    data: {
      userId,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  return { code, destination: user.email ?? user.telephone };
}

export async function changePasswordWithCode(userId: number, code: string, newPassword: string) {
  const verificationCode = await prisma.verificationCode.findFirst({
    where: { userId, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!verificationCode || verificationCode.expiresAt < new Date() || verificationCode.codeHash !== hashCode(code)) {
    throw ApiError.badRequest("Code de vérification invalide ou expiré");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.utilisateur.update({ where: { id: userId }, data: { motDePasse: hash } }),
    prisma.verificationCode.update({ where: { id: verificationCode.id }, data: { usedAt: new Date() } }),
  ]);
}
