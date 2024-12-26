import { Request, Response } from "express";
import { userService } from "../services/userService";
import emailService from "../services/email";
import { EmailTemplateEnum } from "../models/EmailTemplate";

export const getAllUsers = async (_: Request, res: Response): Promise<void> => {
  const all = await userService.getAll();
  res.json(all);
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName) {
      res.status(400).json({
        fullName: "Name is required",
      });
      return;
    }
    if (!email) {
      res.status(400).json({
        email: "E-mail is required",
      });
      return;
    }
    if (!password) {
      res.status(400).json({
        password: "Password is required",
      });
      return;
    }

    const userFound = await userService.getByEmail(email);
    if (userFound !== null) {
      res.status(400).json({
        email: "This e-mail is already in use",
      });
      return;
    }
    const user = userService.register({
      fullName: fullName,
      email: email,
      password: password,
    });

    await emailService.send({
      templateType: EmailTemplateEnum.Welcome,
      to: email,
      placeholders: {
        firstName: fullName,
      },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to create user" });
  }
};
