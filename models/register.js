const mongoose = require("mongoose");
const registerSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
});
module.exports = mongoose.model("Register", registerSchema);
