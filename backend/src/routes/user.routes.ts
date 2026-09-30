import { Router } from "express";
import * as controller from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { handleUploadPhoto } from "../middlewares/uploadPhoto.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  changePasswordSchema,
  changePasswordWithCodeSchema,
  createAdminSchema,
  updateProfileSchema,
  updateUserSchema,
} from "../validators/user.validator";

const router = Router();
router.use(authenticate);

router.get("/", requireRole("ADMIN"), controller.list);
router.post("/", requireRole("ADMIN"), validate(createAdminSchema), controller.create);
router.patch("/:id/status", requireRole("ADMIN"), validate(updateUserSchema), controller.updateStatus);
router.delete("/:id", requireRole("ADMIN"), controller.remove);
router.patch("/me/profile", validate(updateProfileSchema), controller.updateProfile);
router.post("/me/photo", handleUploadPhoto, controller.updatePhoto);
router.post("/me/change-password", validate(changePasswordSchema), controller.changePassword);
router.post("/me/password-code", controller.requestPasswordCode);
router.post("/me/change-password-with-code", validate(changePasswordWithCodeSchema), controller.changePasswordWithCode);

export default router;
