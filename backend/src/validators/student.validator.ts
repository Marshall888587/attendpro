import { z } from "zod";
import { phoneRegex } from "../utils/validators";

export const createStudentSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  email: z.string().email().optional(),
  telephone: z.string().regex(phoneRegex, "Numéro de téléphone invalide").optional(),
  dateNaissance: z.coerce.date().optional(),
  sexe: z.enum(["M", "F"]).optional(),
  classeId: z.coerce.number().int().positive(),
  motDePasse: z.string().min(6).optional(),
});

export const updateStudentSchema = z.object({
  matricule: z.string().min(3).optional(),
  nom: z.string().min(1).optional(),
  prenom: z.string().min(1).optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  telephone: z.union([z.string().regex(phoneRegex, "Numéro de téléphone invalide"), z.literal("")]).optional(),
  dateNaissance: z.coerce.date().optional(),
  sexe: z.enum(["M", "F"]).optional(),
  classeId: z.coerce.number().int().positive().optional(),
  motDePasse: z.string().min(6).optional(),
  statut: z.enum(["ACTIF", "INACTIF"]).optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
