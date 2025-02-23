import { Router } from "express";
import { createUser, getAllUsers } from "../controllers/userController";
import { login, loginGoogle } from "../controllers/authController";
import {
  createProject,
  deleteProject,
  getSelectedProject,
  getProjects,
  updateProjectTitle,
} from "../controllers/projectController";
import {
  addUserToBoard,
  addBoard,
  getBoards,
  getUserstoBoard,
} from "../controllers/boardController";
import { getBacklog } from "../controllers/backlogController";
import {
  addSprint,
  getSprints,
  updateSprint,
} from "../controllers/sprintController";
import { getActiveSprint } from "../controllers/activeSprintController";
import {
  addColumn,
  deleteColumn,
  getColumn,
} from "../controllers/columnController";
import {
  addIssue,
  deleteCard,
  getCards,
  updateCard,
  updateCardContent,
} from "../controllers/issueController";
// import {
//   addLabel,
//   deleteLabel,
//   getLabels,
// } from "../controllers/labelController";
// import {
//   getNotification,
//   markReadNotification,
// } from "../controllers/notificationController";
import { home } from "../controllers/homeController";
import { createProjectKey } from "../controllers/projectKeyController";

const router = Router();

// Define API endpoints
router.get("/", home);
router.post("/register", createUser);
router.get("/register", getAllUsers);
router.post("/login-verification-email", login);
router.post("/login-google", loginGoogle);
router.post("/project", createProject);
router.get("/project", getProjects);
router.patch("/project", updateProjectTitle);
router.delete("/project", deleteProject);
router.post("/project/boards/add-user", addUserToBoard);
router.get("/projects/:projectKey", getSelectedProject);
router.post("/board", addBoard);
router.get("/board", getBoards);
router.get("/board/users", getUserstoBoard);
router.get("/projects/:projectKey/boards/:boardId/backlog", getBacklog);
router.post("/sprint", addSprint);
router.get("/sprint", getSprints);
router.put("/sprint", updateSprint);
router.get("/projects/:projectKey/boards/:boardId", getActiveSprint);
router.get("/column", getColumn);
router.post("/column", addColumn);
router.delete("/column", deleteColumn);
router.post("/card", addIssue);
router.get("/card", getCards);
router.put("/card", updateCard);
router.delete("/card", deleteCard);
router.put("/card/content", updateCardContent);
//router.post("/label", addLabel);
//router.get("/label", getLabels);
//router.delete("/label", deleteLabel);
//router.get("/notification", getNotification);
//router.post("/notification/mark-read", markReadNotification);
router.get("/createProjectKey", createProjectKey);

export default router;
