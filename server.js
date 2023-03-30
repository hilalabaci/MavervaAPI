//jshint esversion:6
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const Register = require("./models/register");
mongoose.connect("mongodb://127.0.0.1:27017/registerDB");
const app = express();
app.use(cors());
var jsonParser = bodyParser.json();

app.get("/", async function (req, res) {
  const filter = {};
  const all = await Register.find(filter);

  res.json(all);
});

app.get("/register", async function (req, res) {
  const filter = {};
  const all = await Register.find(filter);

  res.json(all);
});

app.post("/register", jsonParser, async function (req, res) {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    res.status(400).send("Name is required");
    return;
  }

  const register = new Register({
    fullName: fullName,
    email: email,
    password: password,
  });

  register.save();
  res.json(register.toJSON());
});

app.listen(3001, function () {
  console.log("Server started on the port 3001");
});
