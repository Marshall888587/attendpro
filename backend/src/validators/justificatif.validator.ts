import { z } from "zod";

export const createJustificatifSchema = z.object({
  presenceId: z.coerce.number().int().positive(),
  motif: z.string().min(5),
  documentUrl: z.string().min(1).optional(),
});

export const treatJustificatifSchema = z.object({
  statut: z.enum(["ACCEPTE", "REFUSE"]),
});

export type CreateJustificatifInput = z.infer<typeof createJustificatifSchema>;
