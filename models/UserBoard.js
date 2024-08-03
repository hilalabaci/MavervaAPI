import mongoose from "mongoose";
/* import User from "./models/user.js"; */

const userBoardSchema = new mongoose.Schema({
  boardId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

export default mongoose.model("UserBoard", userBoardSchema);
