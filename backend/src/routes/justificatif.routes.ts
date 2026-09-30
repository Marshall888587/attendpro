import { Router } from "express";
import * as controller from "../controllers/justificatif.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { handleUpload } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createJustificatifSchema, treatJustificatifSchema } from "../validators/justificatif.validator";

const router = Router();
router.use(authenticate);

router.get("/", requireRole("ADMIN", "ETUDIANT"), controller.list);
router.post("/", requireRole("ETUDIANT"), validate(createJustificatifSchema), controller.create);
router.post("/upload", requireRole("ETUDIANT"), handleUpload, controller.uploadDocument);
router.patch("/:id", requireRole("ADMIN"), validate(treatJustificatifSchema), controller.treat);

export default router;
