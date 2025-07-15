export interface RegisterUserInput {
  fullName: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export enum EmailTemplateEnum {
  Welcome = 1,
  VerifyEmail = 2,
}
