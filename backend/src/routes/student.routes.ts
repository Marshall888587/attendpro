import { Router } from "express";
import * as controller from "../controllers/student.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createStudentSchema, updateStudentSchema } from "../validators/student.validator";

const router = Router();
router.use(authenticate);

router.get("/", requireRole("ADMIN", "ENSEIGNANT"), controller.list);
router.get("/:id", requireRole("ADMIN", "ENSEIGNANT"), controller.getOne);
router.post("/", requireRole("ADMIN"), validate(createStudentSchema), controller.create);
router.patch("/:id", requireRole("ADMIN"), validate(updateStudentSchema), controller.update);
router.delete("/:id", requireRole("ADMIN"), controller.remove);
router.patch("/:id/reset-password", requireRole("ADMIN"), controller.resetPassword);

export default router;
