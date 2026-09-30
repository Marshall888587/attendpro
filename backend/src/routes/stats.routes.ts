import { Router } from "express";
import * as controller from "../controllers/stats.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();
router.use(authenticate);

router.get("/dashboard", requireRole("ADMIN"), controller.dashboard);
router.get("/reports", requireRole("ADMIN"), controller.reports);
router.get("/me", requireRole("ETUDIANT"), controller.myStats);

export default router;
