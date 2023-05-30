import mongoose from "mongoose";
/* import User from "./models/user.js"; */

const cardSchema = new mongoose.Schema({
  content: String,
  boardId: {
    type: String,
    required: true,
  },
  status: {
    required: true,
    type: Number,
  },
});

export default mongoose.model("Card", cardSchema);
