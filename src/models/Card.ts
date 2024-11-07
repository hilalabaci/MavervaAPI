import mongoose from "mongoose";

type ObjectId = mongoose.Types.ObjectId;
export interface CardType extends mongoose.Document<ObjectId> {
  content?: string;
  status: number;
  userId: ObjectId;
  cardKey: string;
  createdAt: Date;
  labels: ObjectId[];
  projectKey: ObjectId;
  boardId: ObjectId;
}
const cardSchema = new mongoose.Schema({
  content: String,
  status: {
    required: true,
    type: Number,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cardKey: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
  labels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Label" }],
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
});

export default mongoose.model<CardType>("Card", cardSchema);
