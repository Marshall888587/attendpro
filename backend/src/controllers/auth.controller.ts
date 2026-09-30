import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import * as passwordResetService from "../services/passwordReset.service";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.json(user);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = await passwordResetService.requestReset(req.body.identifiant);
  res.json({
    message: "Si un compte correspond, un lien de réinitialisation a été généré.",
    // Aucun service d'email/SMS n'est configuré : le token est renvoyé directement
    // pour un affichage à l'écran. Brancher un envoi réel ici sans changer le reste du flux.
    token,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await passwordResetService.resetPassword(req.body.token, req.body.newPassword);
  res.status(204).send();
});
