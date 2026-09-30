import { z } from "zod";

export const createSeanceSchema = z.object({
  classeId: z.coerce.number().int().positive(),
  matiereId: z.coerce.number().int().positive(),
  date: z.coerce.date(),
  heureDebut: z.string().min(1),
  heureFin: z.string().optional(),
  salle: z.string().optional(),
});

export const updateCoursStatutSchema = z.object({
  statut: z.enum(["PLANIFIE", "REALISE", "ANNULE"]),
});

export type CreateSeanceInput = z.infer<typeof createSeanceSchema>;
