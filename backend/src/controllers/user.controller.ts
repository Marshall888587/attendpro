import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginatedResponse, getPagination } from "../utils/pagination";
import * as userService from "../services/user.service";
import * as verificationCodeService from "../services/verificationCode.service";
import { ApiError } from "../utils/ApiError";

function maskDestination(value: string) {
  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 1))}@${domain}`;
  }
  return `${"*".repeat(Math.max(value.length - 2, 0))}${value.slice(-2)}`;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { items, total } = await userService.listUsers(pagination, req.query.search as string | undefined);
  res.json(buildPaginatedResponse(items, total, pagination));
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  res.json(await userService.updateUserStatus(Number(req.params.id), req.user!.userId, req.body));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { user, password } = await userService.createAdminUser(req.body);
  res.status(201).json({ user, password });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUserAccount(Number(req.params.id), req.user!.userId);
  res.status(204).send();
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  res.json(await userService.updateProfile(req.user!.userId, req.body));
});

export const updatePhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("Aucune image reçue.");
  res.json(await userService.updatePhoto(req.user!.userId, `/uploads/photos/${req.file.filename}`));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await userService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
  res.status(204).send();
});

export const requestPasswordCode = asyncHandler(async (req: Request, res: Response) => {
  const { code, destination } = await verificationCodeService.requestCode(req.user!.userId);
  res.json({
    message: `Code de vérification généré pour ${maskDestination(destination!)}.`,
    // Aucun service d'email/SMS n'est configuré : le code est renvoyé directement
    // pour un affichage à l'écran. Brancher un envoi réel ici sans changer le reste du flux.
    code,
  });
});

export const changePasswordWithCode = asyncHandler(async (req: Request, res: Response) => {
  await verificationCodeService.changePasswordWithCode(req.user!.userId, req.body.code, req.body.newPassword);
  res.status(204).send();
});
