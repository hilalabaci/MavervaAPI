import mongoose from "mongoose";
import validator from "validator";
import { nanoid } from "nanoid";

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
    required: true,
    minlength: [6, "Password must be at least 8 characters long"],
    maxlength: [128, "Password must be less than 128 characters long"],
  },
  userId: {
    type: String,
    required: true,
    default: () => nanoid(7),
    index: { unique: true },
  },
});

export default mongoose.model("User", userSchema);
