import { handleProjectKey } from "../controllers/wsController";
import { Router } from "express";

export default function mountRouter() {
  const router = Router();

  router.ws("/project", handleProjectKey);

  return router;
}
