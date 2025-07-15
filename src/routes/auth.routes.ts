import { Router } from "express";
import { createUser, getAllUsers } from "../controllers/userController";
import { login, loginGoogle } from "../controllers/authController";

const router = Router();

router.post("/register", createUser);
router.get("/register", getAllUsers);
router.post("/login-verification-email", login);
router.post("/login-google", loginGoogle);

export default router;
