import mongoose from "mongoose";
/* import User from "./models/user.js"; */

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Board", boardSchema);
