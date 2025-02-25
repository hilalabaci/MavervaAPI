import { Request, Response } from "express";
import { userService } from "../services/userService";
import { OAuth2Client } from "google-auth-library";
import { EmailTemplateEnum } from "../services/types";
import emailService from "../services/email";
import { generateToken } from "./verifyToken";

const GOOGLE_OAUTH_CLIENTID = process.env.GOOGLE_OAUTH_CLIENTID as string;
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    let user = await userService.getByEmail(req.body.email);

    if (user === null) {
      res.status(400).json({
        message: "Check your password or email",
      });
      return;
    }
    const userPayload = {
      id: user.Id?.toString(),
      email: user.Email.toString(),
    };
    const token = generateToken(userPayload, "2h");

    await emailService.send({
      templateType: EmailTemplateEnum.VerifyEmail,
      to: req.body.email,
      placeholders: {
        firstName: `${user.FullName}`,
        verifyURL: `https://maverva.hilalabaci.com/login/verify-email?token=${token}`,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "",
    });
  }
};

export const loginGoogle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Auth failed",
      });

      return;
    }
    const accessToken = authorization.split(" ")[1];
    const client = new OAuth2Client({ clientId: GOOGLE_OAUTH_CLIENTID });
    const verifyResult = await client.verifyIdToken({
      idToken: accessToken,
      audience: GOOGLE_OAUTH_CLIENTID,
    });

    const payload = verifyResult.getPayload();

    if (!payload?.email_verified || !payload.email) {
      res.status(401).json({
        message: "Auth failed 2",
      });

      return;
    }

    let user = await userService.getByEmail(payload.email);

    if (!user) {
      user = await userService.register({
        email: payload.email,
        fullName: payload.name ?? "",
        password: "",
        profilePicture: payload.picture,
      });
      await emailService.send({
        templateType: EmailTemplateEnum.Welcome,
        to: payload.email,
        placeholders: {
          firstName: payload.name ?? "",
          loginURL: "",
          setUpProfileURL: "",
          startUpGuideURL: "",
        },
      });
    }
    if (payload.picture && user.ProfilePicture !== payload.picture) {
      await userService.updateProfilePicture(user.Id, payload.picture);
    }
    res.status(200).json(user);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Check your password or email",
    });
  }
};
