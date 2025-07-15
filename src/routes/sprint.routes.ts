import { Router } from "express";
import {
  addSprint,
  getSprints,
  updateSprint,
} from "../controllers/sprintController";
import { getActiveSprint } from "../controllers/activeSprintController";
import columnRoutes from "./column.routes";
import issueRoutes from "./issue.routes";

const router = Router({ mergeParams: true });
// routes/
// ├── apiRoute.ts               <-- Hepsini burada topluyoruz
// ├── project.routes.ts         <-- /projects
// ├── board.routes.ts           <-- /projects/:projectKey/boards
// ├── sprint.routes.ts          <-- /boards/:boardId/sprints

//frontend route:/projects/:projectKey/boards/:boardId/sprints

router.post("/", addSprint);
router.get("/", getSprints);
router.put("/", updateSprint);
router.get("/active", getActiveSprint);//router.get("/projects/:projectKey/boards/:boardId", getActiveSprint);

// Nested columns and issues
router.use("/:sprintId/columns", columnRoutes);
router.use("/:sprintId/issues", issueRoutes);

export default router;
