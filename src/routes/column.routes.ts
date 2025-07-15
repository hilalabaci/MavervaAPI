import { Router } from "express";
import {
  addColumn,
  deleteColumn,
  getColumn,
} from "../controllers/columnController";

const router = Router({ mergeParams: true });
// routes/
// ├── apiRoute.ts               <-- Hepsini burada topluyoruz
// ├── project.routes.ts         <-- /projects
// ├── board.routes.ts           <-- /projects/:projectKey/boards
// ├── sprint.routes.ts          <-- /boards/:boardId/sprints
// ├── column.routes.ts          <-- /sprints/:sprintId/columns
// └── issue.routes.ts           <-- /sprints/:sprintId/issues

router.get("/", getColumn);
router.post("/", addColumn);
router.delete("/", deleteColumn);

export default router;
