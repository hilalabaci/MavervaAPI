import mongoose from "mongoose";

type ObjectId = mongoose.Types.ObjectId;
export interface CardType extends mongoose.Document<ObjectId> {
  userId: ObjectId;
  content?: string;
  boardId: ObjectId;
  status: number;
  labels: ObjectId[]; // Burada hem ObjectId hem de LabelType olabileceğini belirtir.
}
const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: String,
  projectKey: {
    type: mongoose.Schema.Types.String,
    ref: "Project",
    required: true,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  status: {
    required: true,
    type: Number,
  },
  labels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Label" }],
});

export default mongoose.model<CardType>("Card", cardSchema);
