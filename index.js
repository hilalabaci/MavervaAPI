//jshint esversion:6
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import User from "./models/User.js";
import Card from "./models/Card.js";
import Board from "./models/Board.js";
import Label from "./models/Label.js";

dotenv.config();

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/userDB`
);
const app = express();
app.use(cors());
var jsonParser = bodyParser.json();

/***************************** / *****************************/
app
  .route("/")

  .get(async function (req, res) {
    res.json({ version: "1.2" });
  });

/***************************** /register *****************************/
app
  .route("/register")

  .post(jsonParser, async function (req, res) {
    const { fullName, email, password } = req.body;

    if (!fullName) {
      res.status(400).json({
        fullName: "Name is required",
      });
      return;
    }
    if (!email) {
      res.status(400).json({
        email: "E-mail is required",
      });
      return;
    }
    if (!password) {
      res.status(400).json({
        password: "Password is required",
      });
      return;
    }
    const filter = { email: email };
    const userMatch = await User.findOne(filter);

    if (userMatch !== null) {
      res.status(400).json({
        email: "This e-mail is already in use",
      });
      return;
    }
    const user = new User({
      fullName: fullName,
      email: email,
      password: password,
    });
    user.save();
    res.json(user.toJSON());
  })

  .get(async function (req, res) {
    const filter = {};
    const all = await User.find(filter);
    res.json(all);
  });

/***************************** /login *****************************/
app
  .route("/login")

  .post(jsonParser, async function (req, res) {
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

/***************************** /board *****************************/
app
  .route("/board")

  .post(jsonParser, async function (req, res) {
    const { title, userId } = req.body;
    const newBoard = new Board({
      title: title,
      userId: userId,
    });
    await newBoard.save();
    res.json(newBoard.toJSON());
  })

  .get(async function (req, res) {
    const filter = { userId: req.query.userId };
    const allBoards = await Board.find(filter);
    res.json(allBoards);
  })

  .patch(jsonParser, async function (req, res) {
    const filter = { _id: req.body.id };
    const update = { title: req.body.title };
    const boardTitle = await Board.findOneAndUpdate(filter, update, {
      new: true,
    });
    res.json(boardTitle.toJSON());
  })

  .delete(async function (req, res) {
    const id = req.query.id;
    const filter = { boardId: id };
    await Card.deleteMany(filter);
    await Board.deleteOne({ _id: id });
    res.sendStatus(200);
  });

/***************************** /card *****************************/
app
  .route("/card")

  .post(jsonParser, async function (req, res) {
    const { content, boardId, status } = req.body;
    const newCard = new Card({
      content: content,
      boardId: boardId,
      status: status,
    });
    await newCard.save();
    res.json(newCard.toJSON());
  })
  .get(async function (req, res) {
    const filter = { boardId: req.query.boardId };
    const all = await Card.find(filter).populate("labels");
    res.json(all);
  })

  .patch(jsonParser, async function (req, res) {
    const filter = { _id: req.body.id };
    const update = { status: req.body.status };
    const card = await Card.findOneAndUpdate(filter, update, {
      new: true,
    });
    const cardsToReturn = await card.populate("labels");
    res.json(cardsToReturn.toJSON());
  })

  .delete(async function (req, res) {
    const id = req.query.id;
    await Card.deleteOne({ _id: id });
    await Label.deleteMany({ cardId: id });
    res.sendStatus(200);
  });

/***************************** /label *****************************/
app
  .route("/label")

  .post(jsonParser, async function (req, res) {
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
  })

  .get(async function (req, res) {
    const filter = { cardId: req.query.cardId };
    const all = await Label.find(filter);
    res.json(all);
  })

  .delete(async function (req, res) {
    const id = req.query.id;
    await Label.deleteOne({ _id: id });
    res.sendStatus(200);
  });

/***************************** LISTEN *****************************/

app.listen(3001, function () {
  console.log("Server started on the port 3001");
});
