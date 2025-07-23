import { Router } from "express";
import { createUser, getAllUsers } from "../controllers/userController";

const router = Router();

router.post("/register", createUser);
router.get("/register", getAllUsers);

export default router;
