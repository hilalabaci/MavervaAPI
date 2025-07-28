import { Router } from "express";
import {
  addBoard,
  getBoards,
  getUsersToBoard,
  addUserToBoard,
} from "../controllers/boardController";
import * as backlogController from "../controllers/backlogController";
import sprintRoutes from "./sprint.routes";

const router = Router({ mergeParams: true });


router.post("/", addBoard);
router.get("/", getBoards);
router.get("/:boardId/users", getUsersToBoard);
router.post("/:boardId/add-user", addUserToBoard);
router.get("/:boardId/backlog", backlogController.getBacklog);

// Assuming issues are nested under sprints
router.use("/:boardId/sprints", sprintRoutes);
router.use("/:sprintId/issues", sprintRoutes);

export default router;
 