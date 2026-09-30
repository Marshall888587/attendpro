import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

export const loginSchema = z.object({
  email: z.string().min(1, "Email ou téléphone requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const forgotPasswordSchema = z.object({
  identifiant: z.string().min(3, "Email ou numéro de téléphone requis"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Lien de réinitialisation invalide"),
  newPassword: passwordRule,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
