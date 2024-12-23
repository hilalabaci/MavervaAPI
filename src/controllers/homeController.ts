import { Request, Response } from "express";
import { config } from "../config";
// import emailService from "../services/email";

export const home = async (_: Request, res: Response): Promise<void> => {
  // await emailService.send();
  res.json({ version: config.version });
};
