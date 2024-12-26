import mongoose from "mongoose";

type ObjectId = mongoose.Types.ObjectId;

export enum EmailTemplateEnum {
  Welcome = 1,
  ResetPassword = 2,
}

export interface EmailTemplateType extends mongoose.Document<ObjectId> {
  from: string;
  subject: string;
  htmlBody: string;
  type: EmailTemplateEnum;
}

const emailTemplateSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  htmlBody: {
    type: String,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
});
export default mongoose.model<EmailTemplateType>(
  "EmailTemplate",
  emailTemplateSchema,
);
