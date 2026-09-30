import { Router } from "express";
import * as controller from "../controllers/teacher.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createTeacherSchema, updateTeacherSchema } from "../validators/teacher.validator";

const router = Router();
router.use(authenticate);

router.get("/", requireRole("ADMIN"), controller.list);
router.get("/stats", requireRole("ADMIN"), controller.stats);
router.post("/", requireRole("ADMIN"), validate(createTeacherSchema), controller.create);
router.patch("/:id", requireRole("ADMIN"), validate(updateTeacherSchema), controller.update);
router.delete("/:id", requireRole("ADMIN"), controller.remove);
router.patch("/:id/reset-password", requireRole("ADMIN"), controller.resetPassword);

export default router;
