import mongoose from "mongoose";

type ObjectId = mongoose.Types.ObjectId;
export interface BoardType extends mongoose.Document<ObjectId> {
  title: string;
  projectIds: ObjectId[];
  users: ObjectId[];
  columnIds: ObjectId[];
}
const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  projectIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  ],
  users: [
    {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  columnIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Column",
    },
  ],
});

export default mongoose.model<BoardType>("Board", boardSchema);
