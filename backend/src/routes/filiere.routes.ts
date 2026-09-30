import { Router } from "express";
import * as controller from "../controllers/filiere.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createFiliereSchema, updateFiliereSchema } from "../validators/class.validator";

const router = Router();
router.use(authenticate);

router.get("/", controller.list);
router.post("/", requireRole("ADMIN"), validate(createFiliereSchema), controller.create);
router.patch("/:id", requireRole("ADMIN"), validate(updateFiliereSchema), controller.update);
router.delete("/:id", requireRole("ADMIN"), controller.remove);

export default router;
