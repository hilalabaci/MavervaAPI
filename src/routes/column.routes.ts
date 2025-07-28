import { Router } from "express";
import {
  addColumn,
  deleteColumn,
  getColumn,
} from "../controllers/columnController";

const router = Router({ mergeParams: true });

router.get("/", getColumn);
router.post("/", addColumn);
router.delete("/:columnId", deleteColumn);

export default router;
