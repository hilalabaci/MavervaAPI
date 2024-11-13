import { Request, Response } from "express";
import { userService } from "../services/userService";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userService.getByEmailAndPassword(
      req.body.email,
      req.body.password,
    );
    if (user === null) {
      res.status(400).json({
        message: "Check your password or email",
      });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Check your password or email",
    });
  }
};
