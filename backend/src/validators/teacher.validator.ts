import { z } from "zod";
import { phoneRegex } from "../utils/validators";

export const createTeacherSchema = z
  .object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    email: z.string().email().optional(),
    telephone: z.string().regex(phoneRegex, "Numéro de téléphone invalide").optional(),
    specialite: z.string().optional(),
    motDePasse: z.string().min(6).optional(),
  })
  .refine((d) => Boolean(d.email || d.telephone), {
    message: "Un email ou un numéro de téléphone est requis",
    path: ["email"],
  });

export const updateTeacherSchema = z.object({
  matriculeEns: z.string().min(3).optional(),
  nom: z.string().min(1).optional(),
  prenom: z.string().min(1).optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  telephone: z.union([z.string().regex(phoneRegex, "Numéro de téléphone invalide"), z.literal("")]).optional(),
  specialite: z.string().optional(),
  motDePasse: z.string().min(6).optional(),
  statut: z.enum(["ACTIF", "EN_CONGE"]).optional(),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
