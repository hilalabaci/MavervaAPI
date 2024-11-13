import { Request, Response } from "express";
import { config } from "../config";

export const home = async (_: Request, res: Response): Promise<void> => {
  res.json({ version: config.version });
};
