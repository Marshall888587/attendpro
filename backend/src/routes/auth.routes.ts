import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "../validators/auth.validator";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

export default router;
