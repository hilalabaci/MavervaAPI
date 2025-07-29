import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(`Error on ${req.method} ${req.url}: ${err.stack}`);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    // message: err.message, // dev için açılabilir
  });
};
export default errorHandler;