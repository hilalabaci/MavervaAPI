import mongoose from "mongoose";
/* import User from "./models/user.js"; */

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: String,
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

export default mongoose.model("Card", cardSchema);
