import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { userService } from "../services/userService";
import { OAuth2Client } from "google-auth-library";
import emailService from "../services/email";
import { generateToken } from "./verifyToken";
import { getGoogleUserInfo, GoogleUserInfo } from "../utils/google";
import { generateOtp } from "../utils/generateOtp";
import { EmailTemplateEnum } from "@prisma/client";
import bcrypt from "bcrypt";

const GOOGLE_OAUTH_CLIENTID = process.env.GOOGLE_OAUTH_CLIENTID as string;

/**
 * Handles Google login for users.
 * It verifies the user's token and retrieves their information.
 * If the user does not exist, it registers them and sends a welcome email.
 */

export const loginGoogle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { authorization } = req.headers;
    const { oneTap } = req.query;
    const isOneTap = oneTap === "true";
    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Auth failed",
      });

      return;
    }
    const accessToken = authorization.split(" ")[1];
    const client = new OAuth2Client({ clientId: GOOGLE_OAUTH_CLIENTID });

    let userInfo: GoogleUserInfo | undefined;
    if (isOneTap) {
      // Verify the token using the client
      const ticket = await client.verifyIdToken({
        idToken: accessToken,
        audience: GOOGLE_OAUTH_CLIENTID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(401).json({
          message: "Auth failed 1",
        });
        return;
      }
      userInfo = payload as GoogleUserInfo;
    } else {
      // Verify the token using the client
      const tokenInfo = await client.getTokenInfo(accessToken);

      if (!tokenInfo || !tokenInfo.email) {
        res.status(401).json({
          message: "Auth failed 1",
        });
        return;
      }
      if (!tokenInfo.email_verified) {
        res.status(401).json({
          message: "Email not verified",
        });
        return;
      }

      const googleUserInfo = await getGoogleUserInfo(accessToken);
      userInfo = googleUserInfo as GoogleUserInfo;
    }

    if (!userInfo?.email_verified || !userInfo?.email) {
      res.status(401).json({
        message: "Auth failed 2",
      });

      return;
    }

    let user = await userService.getByEmail(userInfo.email);

    if (!user) {
      user = await userService.register({
        email: userInfo.email,
        fullName: userInfo.name ?? "",
        password: "",
        profilePicture: userInfo.picture,
      });
      await emailService.send({
        templateType: EmailTemplateEnum.Welcome,
        to: userInfo.email,
        placeholders: {
          firstName: userInfo.name ?? "",
          loginURL: "",
          setUpProfileURL: "",
          startUpGuideURL: "",
        },
      });
    }
    if (userInfo.picture && user.ProfilePicture !== userInfo.picture) {
      await userService.updateProfilePicture(user.Id, userInfo.picture);
    }
    res.status(200).json({
      user,
      token: generateToken({ id: user.Id?.toString(), email: user.Email }),
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Check your password or email",
    });
  }
};

/**
 * Handles user login or registration.
 * If the user is registering, it sends an OTP to the provided email.
 * If the user is logging in, it checks if the user exists and sends a verification email.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, mode } = req.body;
    let user = await userService.getByEmail(email);
    if (mode === "register") {
      if (user) {
        res.status(409).json({
          ok: false,
          message: "Account already exists. Please log in.",
        });
        return;
      }
      const otpCode = generateOtp();
      await prisma.otpCode.create({
        data: {
          Email: email,
          Code: otpCode,
          ExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      await emailService.send({
        templateType: EmailTemplateEnum.SendOtp,
        to: email,
        placeholders: {
          otpCode: otpCode.toString(),
        },
      });
      console.log("Verification email sent to:", email, otpCode);
      res.status(200).json({
        ok: email,
        message: "Verification email sent to register address.",
      });
      return;
    }
    if (user === null) {
      res.status(200).json({
        ok: false,
        message: "We couldn't find your account. Please sign up to continue",
      });
      return;
    }
    const userPayload = {
      id: user.Id?.toString(),
      email: user.Email.toString(),
    };
    const token = generateToken(userPayload, "2h");

    await emailService.send({
      templateType: EmailTemplateEnum.SetPassword,
      to: req.body.email,
      placeholders: {
        email: `${user.Email}`,
        verifyURL: `https://maverva.com/login/verify-email?token=${token}`,
      },
    });
    res.status(200).json({
      ok: true,
      data: { ...user, Token: token },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Internal server error.",
    });
  }
};
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const user = await userService.getByEmail(email);
    if (user === null) {
      res.status(404).json({
        message:
          "This email is not registered. Create an account to get started.",
      });
      return;
    }
    if (!user.Password) {
      res.status(400).json({
        message: "Please log in with Google or set a password to log in.",
      });
      return;
    }
    console.log(`user.Password: ${user.Password}`);
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    const token = generateToken({ id: user.Id, email: user.Email }, "2h");
    res.status(200).json({
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: (error as Error).message,
    });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otpCode } = req.body;
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        Email: email,
        Code: otpCode.toString(),
      },
    });
    if (!otpRecord) {
      res.status(400).json({
        ok: false,
        message: "Invalid or expired OTP code.",
      });
      return;
    }
    let user = await userService.getByEmail(email);
    if (!user) return;
    await emailService.send({
      templateType: EmailTemplateEnum.Welcome,
      to: email,
      placeholders: {
        firstName: user.FullName ?? "",
        loginURL: "https://maverva.com/login",
        setUpProfileURL: "https://maverva.com/setup-profile",
        startUpGuideURL: "https://maverva.com/start-guide",
      },
    });

    await prisma.otpCode.delete({
      where: {
        Id: otpRecord.Id,
      },
    });
    const token = generateToken({ id: user.Id, email: user.Email }, "2h");

    res.status(200).json({
      ok: true,
      token,
      user,
    });
  } catch (error) {
    console.error(
      "Invalid or expired verification code. Please try again.",
      error,
    );
    res.status(500).json({
      message: "Invalid or expired verification code. Please try again.",
      error: (error as Error).message,
    });
  }
};
export const sendResetPasswordLink = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    let user = await userService.getByEmail(email);
    if (!user) {
      res.status(404).json({ ok: false, message: "User not found" });
      return;
    }
    const token = generateToken({ id: user.Id, email: user.Email }, "2h");
    const redirectUrl = encodeURIComponent(
      "https://maverva.com/reset-password",
    );
    const verifyLink = `https://maverva.com/login/reset-password/continue?token=${token}&redirect=${redirectUrl}&email=${email}`;

    await emailService.send({
      templateType: EmailTemplateEnum.SetPassword,
      to: email,
      placeholders: {
        email: email,
        verifyURL: verifyLink,
        loginURL: "https://maverva.com/login",
        setUpProfileURL: "https://maverva.com/setup-profile",
        startUpGuideURL: "https://maverva.com/start-guide",
      },
    });
    res.status(200).json({
      ok: true,
      message: "Reset password email sent",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: (error as Error).message,
    });
  }
};
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, newPassword, token } = req.body;
    if (!newPassword) {
      res.status(400).json({ ok: false, message: "Password is required" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`email: ${email}, password: ${newPassword}, token: ${token}`);
    let user = await userService.getByEmail(email);
    if (!user) {
      res.status(404).json({ ok: false, message: "User not found" });
      return;
    }
    const updateUser = await prisma.user.update({
      where: { Id: user.Id },
      data: { Password: hashedPassword },
    });
    console;
    res.status(201).json({
      ok: true,
      data: { ...updateUser, Token: token },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: (error as Error).message,
    });
  }
};
