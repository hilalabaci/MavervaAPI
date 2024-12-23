import { IEmailService } from "./interfaces";
import { MailgunEmailService } from "./mailgunEmailService";

const emailService: IEmailService = new MailgunEmailService();

export default emailService;
