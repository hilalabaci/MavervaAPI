import mongoose from "mongoose";

const labelSchema = new mongoose.Schema({
  colour: String,
  cardId: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Label", labelSchema);
