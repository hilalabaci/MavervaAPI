import mongoose from "mongoose";

type ObjectId = mongoose.Types.ObjectId;
export interface LabelType extends mongoose.Document<ObjectId> {
  colour: string;
  cardId: ObjectId;
}
const labelSchema = new mongoose.Schema({
  colour: String,
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
    required: true,
  },
});

export default mongoose.model<LabelType>("Label", labelSchema);
