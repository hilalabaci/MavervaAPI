import fetch from "node-fetch";
import { IEmailService } from "./interfaces";

const { MAILGUN_API_URL, MAILGUN_API_KEY } = process.env;
const MAILGUN_API_USERNAME = "api";

export class MailgunEmailService implements IEmailService {
  send = async () => {
    const headers = new Headers();

    headers.set(
      "Authorization",
      "Basic " +
        Buffer.from(MAILGUN_API_USERNAME + ":" + MAILGUN_API_KEY).toString(
          "base64",
        ),
    );

    headers.set("Content-Type", "application/x-www-form-urlencoded");

    const formData = new URLSearchParams();
    
    formData.append("from", "Maverva <maverva@mg.hilalabaci.com>");
    formData.append("to", "hilalabaci55@gmail.com");
    formData.append("subject", "My First Email!");
    formData.append(
      "html",
      "<html><body><div>Hello <b>world</b>!</div></body></html>",
    );

    const result = await fetch(MAILGUN_API_URL!, {
      method: "POST",
      headers,
      body: formData,
    });

    return result.ok;
  };
}
