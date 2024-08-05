import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUserId: {
    type: String,
    required: true,
  },
  boardId: {
    required: true,
    type: String,
  },

  createdAdd: {
    required: true,
    type: Date,
    default: Date.now,
  },
  message: {
    required: true,
    type: String,
    maxlength: [
      128,
      "Notification message must be less than 128 characters long",
    ],
  },
  isRead: {
    require: true,
    type: Boolean,
    default: false,
  },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Notification", notificationSchema);
