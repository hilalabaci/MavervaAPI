import { Router } from "express";
import {
  addIssue,
  getIssues,
  updateIssue,
  updateIssueContent,
  deleteIssue,
} from "../controllers/issueController";

const router = Router({ mergeParams: true });

router.post("/", addIssue);
router.get("/", getIssues);
router.delete("/:issueId", deleteIssue);//router.delete("/issue", deleteIssue);
router.put("/:issueId", updateIssue);//router.put("/issue", updateIssue);
router.put("/:issueId/content", updateIssueContent);//router.put("/issue/content", updateIssueContent);

export default router;
