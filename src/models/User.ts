import mongoose from "mongoose";
import validator from "validator";

type ObjectId = mongoose.Types.ObjectId;
export interface IUser extends mongoose.Document<ObjectId> {
  fullName: string;
  email: string;
  password: string;
  projects: ObjectId[];
  boards: ObjectId[];
}
const userSchema = new mongoose.Schema({
  fullName: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  password: {
    type: String,
    minlength: [6, "Password must be at least 8 characters long"],
    maxlength: [128, "Password must be less than 128 characters long"],
  },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
});

export default mongoose.model<IUser>("User", userSchema);
