import { z } from "zod";
import { phoneRegex } from "../utils/validators";

const passwordRule = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

export const updateProfileSchema = z.object({
  nom: z.string().min(1).optional(),
  prenom: z.string().min(1).optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  telephone: z.union([z.string().regex(phoneRegex, "Numéro de téléphone invalide"), z.literal("")]).optional(),
  fonction: z.string().optional(),
  departement: z.string().optional(),
  photoUrl: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordRule,
});

export const changePasswordWithCodeSchema = z.object({
  code: z.string().min(6, "Code de vérification requis"),
  newPassword: passwordRule,
});

export const updateUserSchema = z.object({
  actif: z.boolean().optional(),
  role: z.enum(["ADMIN", "ENSEIGNANT", "ETUDIANT"]).optional(),
});

export const createAdminSchema = z
  .object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    email: z.string().email().optional(),
    telephone: z.string().regex(phoneRegex, "Numéro de téléphone invalide").optional(),
  })
  .refine((d) => Boolean(d.email || d.telephone), {
    message: "Un email ou un numéro de téléphone est requis",
    path: ["email"],
  });
