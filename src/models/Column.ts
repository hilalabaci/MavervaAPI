import mongoose from "mongoose";

type ObjectId = mongoose.Types.ObjectId;
export interface ColumnType extends mongoose.Document<ObjectId> {
  title?: string;
  status: number;
  projectKey: ObjectId;
  boardId: ObjectId;
  cardIds: ObjectId[];
}
const columnSchema = new mongoose.Schema({
  title: String,
  status: {
    type: Number,
  },
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
export const Column = mongoose.model<ColumnType>("Column", columnSchema);
