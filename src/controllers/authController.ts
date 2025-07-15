import { Request, Response } from "express";
import { userService } from "../services/userService";
import { OAuth2Client } from "google-auth-library";
import { EmailTemplateEnum } from "../services/types";
import emailService from "../services/email";
import { generateToken } from "./verifyToken";
import { getGoogleUserInfo, GoogleUserInfo } from "../utils/google";

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
      console.log("googleUserInfo", googleUserInfo);
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
    res.status(200).json(user);
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Check your password or email",
    });
  }
};
