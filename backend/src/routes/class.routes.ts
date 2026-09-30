import { Router } from "express";
import * as controller from "../controllers/class.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createClasseSchema, updateClasseSchema } from "../validators/class.validator";

const router = Router();
router.use(authenticate);

router.get("/", controller.list);
router.get("/stats", controller.stats);
router.post("/", requireRole("ADMIN"), validate(createClasseSchema), controller.create);
router.patch("/:id", requireRole("ADMIN"), validate(updateClasseSchema), controller.update);
router.delete("/:id", requireRole("ADMIN"), controller.remove);

export default router;
