import { Router } from "express";
import { createProjectKey } from "../controllers/projectKeyController";

const router = Router();

router.get("/", createProjectKey);

export default router;
