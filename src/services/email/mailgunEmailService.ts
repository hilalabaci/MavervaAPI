import fetch from "node-fetch";
import { EmailSendParams, IEmailService } from "./interfaces";
import EmailTemplate, { EmailTemplateEnum } from "../../models/EmailTemplate";

const { MAILGUN_API_URL, MAILGUN_API_KEY } = process.env;
const MAILGUN_API_USERNAME = "api";

//2. implement email service
export class MailgunEmailService implements IEmailService {
  send = async (params: EmailSendParams) => {
    if (!params || !params.to || !params.templateType) return false;

    const template = await EmailTemplate.findOne({ type: params.templateType });

    if (!template) return false;

    let subject = this.replacePlaceholders(
      template.subject,
      params.placeholders,
    );

    let htmlBody = this.replacePlaceholders(
      template.htmlBody,
      params.placeholders,
    );

    const headers = new Headers();
    headers.set(
      "Authorization",
      "Basic " +
        Buffer.from(MAILGUN_API_USERNAME + ":" + MAILGUN_API_KEY).toString(
          "base64",
        ),
    );
    headers.set("Content-Type", "application/x-www-form-urlencoded");

    const formData = new URLSearchParams(); //expecting form data not JSON
    formData.append("from", template.from);
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
