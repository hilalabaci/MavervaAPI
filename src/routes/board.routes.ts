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

//frontend route:/projects/:projectKey/boards/

router.post("/", addBoard);
router.get("/", getBoards);
router.get("/:boardId/users", getUsersToBoard); //do it router.get("/project/board/users", getUsersBoards);
router.post("/:boardId/add-user", addUserToBoard); //router.post("/project/boards/add-user", addUserToBoard);
router.get("/:boardId/backlog", backlogController.getBacklog); //router.get("/projects/:projectKey/boards/:boardId/backlog", getBacklog);

// Assuming issues are nested under sprints
router.use("/:boardId/sprints", sprintRoutes);
router.use("/:sprintId/issues", sprintRoutes);

export default router;
 