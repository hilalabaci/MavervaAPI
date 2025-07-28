import logger from "../utils/logger";
import { Request, Response, NextFunction } from "express";

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
};

export default requestLogger;
