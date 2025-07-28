import { Request, Response, NextFunction } from "express";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";
import { config } from "../config";

interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
    } else if (error instanceof JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
    }
    console.error("JWT verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
