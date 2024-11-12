import mongoose from "mongoose";

type ObjectId = mongoose.Types.ObjectId;
export interface SprintType extends mongoose.Document<ObjectId> {
  name: string;
  sprintGoal: String;
  startDate: Date;
  endDate: Date;
  cardIds: ObjectId[];
  boardId: ObjectId;
  active: boolean;
  
}
const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sprintGoal: {
    type: String,
  },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  cardIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
  ],
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  active: {
    type: mongoose.Schema.Types.Boolean,
    required: true,
    default: false,
  },
});

export default mongoose.model<SprintType>("Sprint", sprintSchema);
