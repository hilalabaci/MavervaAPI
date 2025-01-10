import { Request, Response } from "express";
import { userService } from "../services/userService";
import { OAuth2Client } from "google-auth-library";
import { GoogleUserInfo } from "../services/types";
import emailService from "../services/email";
import { EmailTemplateEnum } from "../models/EmailTemplate";
import { generateToken, verifyToken } from "./verifyToken";

const GOOGLE_OAUTH_CLIENTID = process.env.GOOGLE_OAUTH_CLIENTID as string;
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userService.getByEmail(req.body.email);
    if (user === null) {
      res.status(400).json({
        message: "Check your password or email",
      });
      return;
    }
    const userPayload = {
      id: user._id?.toString(),
      email: user.email.toString(),
    };
    const token = generateToken(userPayload, "2h");

    await emailService.send({
      templateType: EmailTemplateEnum.VerifyEmail,
      to: req.body.email,
      placeholders: {
        firstName: `${user.fullName}`,
        verifyURL: `https://maverva.hilalabaci.com/login/verify-email?token=${token}`,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Check your password or email",
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
    const info = await client.getTokenInfo(accessToken);

    if (!info?.email_verified) {
      res.status(401).json({
        message: "Auth failed 2",
      });

      return;
    }

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const googleUserInfo: GoogleUserInfo = await response.json();

    let user = await userService.getByEmail(googleUserInfo.email);

    if (!user) {
      user = await userService.register({
        email: googleUserInfo.email,
        fullName: `${googleUserInfo.given_name} ${googleUserInfo.family_name}`,
      });
    }
    await emailService.send({
      templateType: EmailTemplateEnum.Welcome,
      to: googleUserInfo.email,
      placeholders: {
        firstName: `${googleUserInfo.given_name} ${googleUserInfo.family_name}`,
        loginURL: "",
        setUpProfileURL: "",
        startUpGuideURL: "",
      },
    });
    res.status(200).json(user);
    return;
    // if (user === null) {
    //   res.status(400).json({
    //     message: "Check your password or email",
    //   });
    //   return;
    // }
    // res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Check your password or email",
    });
  }
};
