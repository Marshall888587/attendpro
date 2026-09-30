import { Router } from "express";
import * as controller from "../controllers/notification.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/", controller.list);
router.get("/unread-count", controller.unreadCount);
router.patch("/read-all", controller.markAllAsRead);
router.patch("/:id/read", controller.markAsRead);

export default router;
