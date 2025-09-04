//1. Create Interface for email service implementations

import { EmailTemplateEnum } from "@prisma/client";

export interface IEmailService {
  send: (params: EmailSendParams) => Promise<boolean>;
}

export interface EmailSendParams {
  templateType: EmailTemplateEnum;
  to: string;
  placeholders?: Record<string, string>; //template placeholders
}
