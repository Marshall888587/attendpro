import { z } from "zod";

export const createMatiereSchema = z.object({
  code: z.string().min(2),
  nomMatiere: z.string().min(1),
  coefficient: z.coerce.number().int().min(1).max(10).default(1),
});
export const updateMatiereSchema = createMatiereSchema.partial();

export const createAffectationSchema = z.object({
  matiereId: z.coerce.number().int().positive(),
  enseignantId: z.coerce.number().int().positive(),
  classeId: z.coerce.number().int().positive(),
});

export type CreateMatiereInput = z.infer<typeof createMatiereSchema>;
export type CreateAffectationInput = z.infer<typeof createAffectationSchema>;
