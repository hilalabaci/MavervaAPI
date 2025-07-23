import { Router } from "express";
import homeRoutes from "./home.routes";
import authRoutes from "./auth.routes";
import projectRoutes from "./project.routes";
import projectKeyRoutes from "./projectKey.routes";
import notificationRoutes from "./notification.routes";
import userRoutes from "./user.routes";
import issueRoutes from "./issue.routes";

const router = Router();
// routes/
// ├── apiRoute.ts           <-- Tüm route'lar burada birleşiyor
// ├── project.routes.ts     <-- /projects
// ├── board.routes.ts       <-- /projects/:projectKey/boards
// ├── sprint.routes.ts      <-- /boards/:boardId/sprints
// ├── column.routes.ts      <-- /sprints/:sprintId/columns
// └── issue.routes.ts       <-- /issues

// Projeler	/projects
// Projedeki board'lar	/projects/:projectKey/boards
// Board'daki sprint'ler	/projects/:projectKey/boards/:boardId/sprints
// Sprint'teki column'lar	/projects/:projectKey/boards/:boardId/sprints/:sprintId/columns

router.use("/", homeRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/projects", projectRoutes);
router.use("/createProjectKey", projectKeyRoutes);
router.use("/issues", issueRoutes);

export default router;
