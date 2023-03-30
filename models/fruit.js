const mongoose = require("mongoose");

const fruitSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  confirmPassword:String
});

module.exports = mongoose.model("Fruit", fruitSchema);
