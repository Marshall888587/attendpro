import { z } from "zod";

export const createFiliereSchema = z.object({
  nomFiliere: z.string().min(2),
  departement: z.string().optional(),
});
export const updateFiliereSchema = createFiliereSchema.partial();

export const createClasseSchema = z.object({
  nomClasse: z.string().min(1),
  niveau: z.string().min(1),
  filiereId: z.coerce.number().int().positive(),
  effectifMax: z.coerce.number().int().positive().optional(),
  enseignantResponsableId: z.coerce.number().int().positive().optional(),
});
export const updateClasseSchema = createClasseSchema.partial();

export type CreateClasseInput = z.infer<typeof createClasseSchema>;
export type UpdateClasseInput = z.infer<typeof updateClasseSchema>;
