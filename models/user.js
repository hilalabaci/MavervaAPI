import mongoose from "mongoose";
import { nanoid } from "nanoid";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  userId: {
    type: String,
    required: true,
    default: () => nanoid(7),
    index: { unique: true },
  },
});

export default mongoose.model("User", userSchema);
