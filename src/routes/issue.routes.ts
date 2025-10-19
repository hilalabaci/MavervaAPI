import { Router } from "express";
import {
  addIssue,
  getIssues,
  updateIssue,
  updateIssueContent,
  deleteIssue,
  updateAssignUser,
} from "../controllers/issueController";

const router = Router({ mergeParams: true });

router.post("/", addIssue);
router.get("/", getIssues);
router.delete("/:issueId", deleteIssue);
router.put("/:issueId", updateIssue);
router.put("/:issueId/content", updateIssueContent);
router.put("/:issueId/assignee", updateAssignUser);

export default router;
