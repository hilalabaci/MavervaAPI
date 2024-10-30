import mongoose from "mongoose";

type ObjectId = mongoose.Types.ObjectId;
export interface BacklogType extends mongoose.Document<ObjectId> {
  boardId: ObjectId;
  cardIds: ObjectId[];
  sprintIds: ObjectId[];
}
const backlogSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  cardIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
  ],
});

export default mongoose.model<BacklogType>("Backlog", backlogSchema);
