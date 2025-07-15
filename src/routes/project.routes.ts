import { Router } from "express";
import {
  createProject,
  deleteProject,
  getSelectedProject,
  getProjects,
  updateProjectTitle,
  updateProjectToFavorite,
} from "../controllers/projectController";
import { addUserToBoard } from "controllers/boardController";
import boardRoutes from "./board.routes";

const router = Router();

router.post("/", createProject);
router.get("/", getProjects);
router.delete("/", deleteProject);
router.patch("/", updateProjectTitle);
router.put("/favourite", updateProjectToFavorite);
router.get("/:projectKey", getSelectedProject);


router.use("/:projectKey/boards", boardRoutes);

export default router;
