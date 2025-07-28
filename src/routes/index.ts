import { Router } from "express";
import homeRoutes from "./home.routes";
import authRoutes from "./auth.routes";
import projectRoutes from "./project.routes";
import projectKeyRoutes from "./projectKey.routes";
import notificationRoutes from "./notification.routes";
import userRoutes from "./user.routes";
import issueRoutes from "./issue.routes";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use("/", homeRoutes);
router.use("/auth", authRoutes);
router.use("/users", authMiddleware, userRoutes);
router.use("/notifications", authMiddleware, notificationRoutes);
router.use("/projects", authMiddleware, projectRoutes);
router.use("/createProjectKey", projectKeyRoutes);
router.use("/issues", authMiddleware, issueRoutes);

export default router;
