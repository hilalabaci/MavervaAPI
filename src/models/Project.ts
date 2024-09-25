import mongoose from "mongoose";
/* import User from "./models/user.js"; */

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  projectKey: {
    type: String,
    required: true,
  },
  users: [
    {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  boards: [
    {
      ref: "Board",
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
});

export default mongoose.model("Project", projectSchema);
