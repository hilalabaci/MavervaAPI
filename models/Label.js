import mongoose from "mongoose";

const labelSchema = new mongoose.Schema({
  colour: String,
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
    required: true,
  },
});

export default mongoose.model("Label", labelSchema);
