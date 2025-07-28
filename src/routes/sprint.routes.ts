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

router.post("/", addSprint);
router.get("/", getSprints);
router.put("/", updateSprint);
router.get("/active", getActiveSprint);

// Nested columns and issues
router.use("/:sprintId/columns", columnRoutes);

export default router;
