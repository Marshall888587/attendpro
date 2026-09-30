import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  unreadOnly: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});
