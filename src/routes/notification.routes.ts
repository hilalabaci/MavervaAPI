import { Router } from "express";
import {
  getNotification,
  markReadNotification,
} from "../controllers/notificationController";

const router = Router();

router.get("/", getNotification);
router.post("/mark-read", markReadNotification);

export default router;
