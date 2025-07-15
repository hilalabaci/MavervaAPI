import { Router } from "express";
import { home as renderHomePage } from "../controllers/homeController";

const router = Router();

router.get("/", renderHomePage);

export default router;
