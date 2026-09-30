import { z } from "zod";

export const presenceStatutEnum = z.enum(["PRESENT", "ABSENT", "RETARD", "ABSENCE_JUSTIFIEE"]);

export const saveBulkPresenceSchema = z.object({
  coursId: z.coerce.number().int().positive(),
  presences: z
    .array(
      z.object({
        etudiantId: z.number().int().positive(),
        statut: presenceStatutEnum,
      })
    )
    .min(1),
});

export const updatePresenceSchema = z.object({
  statut: presenceStatutEnum,
});

export type SaveBulkPresenceInput = z.infer<typeof saveBulkPresenceSchema>;
