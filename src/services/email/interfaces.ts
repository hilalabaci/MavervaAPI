export interface IEmailService {
  send: () => Promise<boolean>;
}
