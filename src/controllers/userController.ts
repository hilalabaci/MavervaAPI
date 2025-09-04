import { Request, Response } from "express";
import { userService } from "../services/userService";
import dotenv from "dotenv";
import { ok } from "assert";
dotenv.config();

export const getAllUsers = async (_: Request, res: Response): Promise<void> => {
  try {
    const all = await userService.getAll();
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // if (!fullName) {
    //   res.status(400).json({
    //     fullName: "Name is required",
    //   });
    //   return;
    // }
    // if (!email) {
    //   res.status(400).json({
    //     email: "E-mail is required",
    //   });
    //   return;
    // }
    // if (!password) {
    //   res.status(400).json({
    //     password: "Password is required",
    //   });
    //   return;
    // }

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

    // await emailService.send({
    //   templateType: EmailTemplateEnum.Welcome,
    //   to: email,
    //   placeholders: {
    //     firstName: fullName,
    //     loginURL: "",
    //     setUpProfileURL: "",
    //     startUpGuideURL: "",
    //   },
    // });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to create user" });
  }
};

export const findUserByEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const email = req.query.email as string | undefined;
    console.log(`: ${email}`);
    if (!email) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    console.log(`: ${email}`);
    const userFound = await userService.getByEmail(email);
    if (userFound === null) {
      res.status(404).json({
        email: "This email is not registered",
        message:
          "This email is not registered. Create an account to get started.",
        ok: false,
      });
      return;
    }
    console.log(`userfound: ${userFound}`);
    res.status(201).json({ ok: true, message: "User created successfully" });
  } catch (err) {
    res.status(500).json({
      message:
        "This email is not registered. Create an account to get started.",
      error: (err as Error).message,
    });
  }
};
