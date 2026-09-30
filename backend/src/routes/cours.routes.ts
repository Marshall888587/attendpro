import { Router } from "express";
import * as controller from "../controllers/cours.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createSeanceSchema, updateCoursStatutSchema } from "../validators/cours.validator";

const router = Router();
router.use(authenticate);

router.get("/affectations", requireRole("ADMIN", "ENSEIGNANT"), controller.listAffectations);
router.post("/seances", requireRole("ADMIN", "ENSEIGNANT"), validate(createSeanceSchema), controller.getOrCreateSeance);
router.get("/seances/:id", requireRole("ADMIN", "ENSEIGNANT"), controller.getSeance);
router.patch(
  "/seances/:id/statut",
  requireRole("ADMIN", "ENSEIGNANT"),
  validate(updateCoursStatutSchema),
  controller.updateStatut
);

export default router;
