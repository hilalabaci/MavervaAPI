import { Router } from "express";
import {
  createUser,
  findUserByEmail,
  getAllUsers,
} from "../controllers/userController";
import {
  login,
  loginGoogle,
  resetPassword,
  verifyOtp,
} from "../controllers/authController";

const router = Router();

router.post("/register", createUser);
router.get("/register", getAllUsers);
router.get("/find-user-by-email", findUserByEmail);
router.post("/login-verification-email", login);
router.post("/login-google", loginGoogle);
router.post("/signUp-verification-code", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
