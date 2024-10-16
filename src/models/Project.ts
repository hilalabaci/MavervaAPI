import mongoose from "mongoose";
/* import User from "./models/user.js"; */

type ObjectId = mongoose.Types.ObjectId;
export interface ProjectType extends mongoose.Document<ObjectId> {
  title: string;
  projectKey: string;
  users: ObjectId[];
  boards: ObjectId[];
}
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

export default mongoose.model<ProjectType>("Project", projectSchema);
