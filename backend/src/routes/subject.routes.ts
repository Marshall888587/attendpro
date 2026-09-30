import { Router } from "express";
import * as controller from "../controllers/subject.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createAffectationSchema, createMatiereSchema, updateMatiereSchema } from "../validators/subject.validator";

const router = Router();
router.use(authenticate);

router.get("/", controller.list);
router.get("/stats", requireRole("ADMIN"), controller.stats);
router.post("/", requireRole("ADMIN"), validate(createMatiereSchema), controller.create);
router.patch("/:id", requireRole("ADMIN"), validate(updateMatiereSchema), controller.update);
router.delete("/:id", requireRole("ADMIN"), controller.remove);

router.post(
  "/affectations",
  requireRole("ADMIN"),
  validate(createAffectationSchema),
  controller.createAffectation
);
router.delete("/affectations/:id", requireRole("ADMIN"), controller.removeAffectation);

export default router;
