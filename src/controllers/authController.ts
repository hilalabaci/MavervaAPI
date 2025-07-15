import { Request, Response } from "express";
import { userService } from "../services/userService";
import { OAuth2Client } from "google-auth-library";
import { EmailTemplateEnum } from "../services/types";
import emailService from "../services/email";
import { generateToken } from "./verifyToken";
import { getGoogleUserInfo } from "../utils/google";

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
    const tokenInfo = await client.getTokenInfo(accessToken);

    const userInfo = await getGoogleUserInfo(accessToken);

    if (!tokenInfo?.email_verified || !tokenInfo.email) {
      res.status(401).json({
        message: "Auth failed 2",
      });

      return;
    }

    let user = await userService.getByEmail(tokenInfo.email);

    if (!user) {
      user = await userService.register({
        email: tokenInfo.email,
        fullName: userInfo.name ?? "",
        password: "",
        profilePicture: userInfo.picture,
      });
      await emailService.send({
        templateType: EmailTemplateEnum.Welcome,
        to: tokenInfo.email,
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
    res.status(200).json(user);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Check your password or email",
    });
  }
};
