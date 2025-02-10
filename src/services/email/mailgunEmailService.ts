import { EmailTemplateEnum, PrismaClient } from "@prisma/client";
import { EmailSendParams, IEmailService } from "./interfaces";
import fetch from "node-fetch";
const prisma = new PrismaClient();
const { MAILGUN_API_URL, MAILGUN_API_KEY } = process.env;
const MAILGUN_API_USERNAME = "api";

//2. implement email service
export class MailgunEmailService implements IEmailService {
  send = async (params: EmailSendParams): Promise<boolean> => {
    if (!params || !params.to || !params.templateType) return false;

    const template = await prisma.emailTemplate.findFirst({
      where: {
        Type: EmailTemplateEnum.VerifyEmail, // Enum değerini kullanıyoruz
      },
    });

    if (!template) return false;

    let subject = this.replacePlaceholders(
      template.Subject,
      params.placeholders,
    );

    let htmlBody = this.replacePlaceholders(
      template.HtmlBody,
      params.placeholders,
    );

    const headers: Record<string, string> = {
      Authorization:
        "Basic " +
        Buffer.from(MAILGUN_API_USERNAME + ":" + MAILGUN_API_KEY).toString(
          "base64",
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const formData = new URLSearchParams(); //expecting form data not JSON
    formData.append("from", template.From);
    formData.append("to", params.to);
    formData.append("subject", subject);
    formData.append("html", htmlBody);

    const result = await fetch(MAILGUN_API_URL!, {
      method: "POST",
      headers,
      body: formData,
    });

    return result.ok;
  };

  private replacePlaceholders = (
    text: string,
    placeholders?: Record<string, string>,
  ): string => {
    if (!placeholders || !text) {
      return text; // No placeholders to replace
    }

    for (const placeholder in placeholders) {
      if (placeholders.hasOwnProperty(placeholder)) {
        const regex = new RegExp(`{{${placeholder}}}`, "g"); // Create a regex for each placeholder
        const replacement = placeholders[placeholder];
        text = text.replace(regex, replacement);
      }
    }

    return text;
  };
}
