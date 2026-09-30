import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import studentRoutes from "./student.routes";
import teacherRoutes from "./teacher.routes";
import classRoutes from "./class.routes";
import filiereRoutes from "./filiere.routes";
import subjectRoutes from "./subject.routes";
import coursRoutes from "./cours.routes";
import presenceRoutes from "./presence.routes";
import justificatifRoutes from "./justificatif.routes";
import statsRoutes from "./stats.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/classes", classRoutes);
router.use("/filieres", filiereRoutes);
router.use("/subjects", subjectRoutes);
router.use("/cours", coursRoutes);
router.use("/presences", presenceRoutes);
router.use("/justificatifs", justificatifRoutes);
router.use("/stats", statsRoutes);
router.use("/notifications", notificationRoutes);

export default router;
