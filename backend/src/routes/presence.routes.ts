import { Router } from "express";
import * as controller from "../controllers/presence.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { saveBulkPresenceSchema, updatePresenceSchema } from "../validators/presence.validator";

const router = Router();
router.use(authenticate);

router.post("/", requireRole("ADMIN", "ENSEIGNANT"), validate(saveBulkPresenceSchema), controller.saveBulk);
router.patch("/:id", requireRole("ADMIN", "ENSEIGNANT"), validate(updatePresenceSchema), controller.update);
router.get("/history", controller.history);
router.get("/stats", requireRole("ADMIN"), controller.globalStats);

export default router;
