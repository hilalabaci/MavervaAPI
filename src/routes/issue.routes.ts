import { Router } from "express";
import {
  addIssue,
  getIssues,
  updateIssue,
  updateIssueContent,
  deleteIssue,
} from "../controllers/issueController";

const router = Router({ mergeParams: true });
// routes/
// ├── apiRoute.ts               <-- Hepsini burada topluyoruz
// ├── project.routes.ts         <-- /projects
// ├── board.routes.ts           <-- /projects/:projectKey/boards
// ├── sprint.routes.ts          <-- /boards/:boardId/sprints
// ├── column.routes.ts          <-- /sprints/:sprintId/columns
// └── issue.routes.ts           <-- /sprints/:sprintId/issues
//frontend route:/projects/:projectKey/boards/:boardId/sprints/:sprintId/issues

router.post("/", addIssue);
router.get("/", getIssues);
router.delete("/:issueId", deleteIssue);//router.delete("/issue", deleteIssue);
router.put("/:issueId", updateIssue);//router.put("/issue", updateIssue);
router.put("/:issueId/content", updateIssueContent);//router.put("/issue/content", updateIssueContent);

export default router;
