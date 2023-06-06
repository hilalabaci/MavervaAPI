//jshint esversion:6
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import User from "./models/User.js";
import Card from "./models/Card.js";
import Board from "./models/Board.js";
import Label from "./models/Label.js";

mongoose.connect("mongodb://127.0.0.1:27017/userDB");
const app = express();
app.use(cors());
var jsonParser = bodyParser.json();

/***************************** All POST methods *****************************/
app.post("/login", jsonParser, async function (req, res) {
  const filter = { email: req.body.email, password: req.body.password };
  const user = await User.findOne(filter);
  if (user === null) {
    res.status(400).json({
      message: "Check your password or email",
    });
    return;
  }
  res.json(user);
});

app.post("/register", jsonParser, async function (req, res) {
  const { fullName, email, password } = req.body;
  if (!fullName) {
    res.status(400).send("Name is required");
    return;
  }
  const user = new User({
    fullName: fullName,
    email: email,
    password: password,
  });
  user.save();
  res.json(user.toJSON());
});

app.post("/board", jsonParser, async function (req, res) {
  const { title, userId } = req.body;
  const newBoard = new Board({
    title: title,
    userId: userId,
  });
  await newBoard.save();
  res.json(newBoard.toJSON());
});
app.post("/card", jsonParser, async function (req, res) {
  const { content, boardId, status } = req.body;
  const newCard = new Card({
    content: content,
    boardId: boardId,
    status: status,
  });
  await newCard.save();
  res.json(newCard.toJSON());
});

app.post("/label", jsonParser, async function (req, res) {
  const { colour, cardId, add } = req.body;
  const card = await Card.findById(cardId);
  const cardWithLabels = await card.populate("labels");

  const labelExists = cardWithLabels.labels.find(
    (label) => label.colour === colour
  );
  if (labelExists) {
    /* remove label */
    if (!add) {
      card.labels = card.labels.filter(
        (labelId) => labelId !== labelExists._id
      );
      await card.save();
      await Label.deleteOne({ _id: labelExists._id });
      const cardToReturn = await card.populate("labels");
      res.json(cardToReturn);
      return;
    }

    res.json(cardWithLabels);
    return;
  }

  if (!labelExists && !add) {
    res.json(cardWithLabels);
    return;
  }
  /* Add label */
  const newLabel = new Label({
    colour: colour,
    cardId: cardId,
  });
  await newLabel.save();

  card.labels.push(newLabel._id);
  await card.save();
  const cardsToReturn = await card.populate("labels");
  res.json(cardsToReturn.toJSON());
});
/***************************** All GET methods *****************************/

app.get("/", async function (req, res) {
  const filter = {};
  const all = await User.find(filter);
  res.json(all);
});
app.get("/register", async function (req, res) {
  const filter = {};
  const all = await User.find(filter);
  res.json(all);
});
app.get("/board", async function (req, res) {
  const filter = { userId: "645d1cd8039320f78d51f4a7" };
  const allBoards = await Board.find(filter);
  res.json(allBoards);
});
app.get("/card", async function (req, res) {
  const filter = { boardId: req.query.boardId };
  const all = await Card.find(filter).populate("labels");
  res.json(all);
});
app.get("/label", async function (req, res) {
  const filter = { cardId: req.query.cardId };
  const all = await Label.find(filter);
  res.json(all);
});

/***************************** All PATCH methods *****************************/
app.patch("/card", jsonParser, async function (req, res) {
  const filter = { _id: req.body.id };
  const update = { status: req.body.status };
  const card = await Card.findOneAndUpdate(filter, update, {
    new: true,
  });
  const cardsToReturn = await card.populate("labels");
  res.json(cardsToReturn.toJSON());
});

/***************************** All DELETE methods *****************************/
app.delete("/board", async function (req, res) {
  const id = req.query.id;
  const filter = { boardId: id };
  await Card.deleteMany(filter);
  await Board.deleteOne({ _id: id });
  res.sendStatus(200);
});

app.delete("/card", async function (req, res) {
  const id = req.query.id;
  await Card.deleteOne({ _id: id });
  await Label.deleteMany({ cardId: id });
  res.sendStatus(200);
});
app.delete("/label", async function (req, res) {
  const id = req.query.id;
  await Label.deleteOne({ _id: id });
  res.sendStatus(200);
});

/***************************** LISTEN *****************************/
app.listen(3001, function () {
  console.log("Server started on the port 3001");
});
