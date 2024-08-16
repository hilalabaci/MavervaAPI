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
import UserBoard from "./models/UserBoard.js";
import Notification from "./models/Notification.js";

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
    const newUserBoard = new UserBoard({
      boardId: newBoard._id,
      userId: userId,
    });
    await newUserBoard.save();

    res.json(newBoard.toJSON());
  })

  .get(async function (req, res) {
    const filter = { userId: req.query.userId };
    console.log("filter", JSON.stringify(filter));
    const allUserBoards = await UserBoard.find(filter);
    console.log("allUserBoards", JSON.stringify(allUserBoards));
    const boardIds = allUserBoards.map((ub) => ub.boardId);
    console.log("boardIds", boardIds);
    const boadFilter = { _id: { $in: boardIds } };
    const allBoards = await Board.find(boadFilter);
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
    await UserBoard.deleteMany(filter);
    await Board.deleteOne({ _id: id });
    res.sendStatus(200);
  });

app.route("/board/add-user").post(jsonParser, async function (req, res) {
  const { boardId, email, userId } = req.body;
  const userFilter = { email: email };
  const userMatch = await User.findOne(userFilter);
  if (userMatch === null) {
    res.status(400).json({
      message: "User not found",
    });
    return;
  }
  const boardFilter = { _id: boardId };
  const boardMatch = await Board.findOne(boardFilter);
  if (boardMatch === null) {
    res.status(400).json({
      message: "Board not found",
    });
    return;
  }
  const userBoardFilter = { userId: userMatch._id, boardId: boardId };
  const hasUserBoard = await UserBoard.findOne(userBoardFilter);
  if (hasUserBoard) {
    res.status(400).json({
      message: "User already exists in the board",
    });
    return;
  }

  const newUserBoard = new UserBoard({
    boardId: boardId,
    userId: userMatch._id,
  });
  await newUserBoard.save();
  /***************************** notification/post *****************************/

  const newNotification = new Notification({
    fromUserId: userId,
    toUserId: userMatch._id,
    message: `Added you to the board ${boardMatch.title}`,
  });

  await newNotification.save();

  res.json(newUserBoard.toJSON());
});

/***************************** /card *****************************/
app
  .route("/card")

  .post(jsonParser, async function (req, res) {
    const { content, boardId, status, userId } = req.body;
    const newCard = new Card({
      userId: userId,
      content: content,
      boardId: boardId,
      status: status,
    });
    await newCard.save();
    res.json(newCard.toJSON());
  })
  .get(async function (req, res) {
    const filter = { boardId: req.query.boardId };
    const all = await Card.find(filter).populate("labels").populate("userId");;
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
    ç;
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

/***************************** NOTIFICATIONS *****************************/
app.route("/notification").get(async function (req, res) {
  const filter = { toUserId: req.query.userId };
  const all = await Notification.find(filter).populate({
    path: "fromUserId",
    select: "-password", // Exclude the password field
  });

  res.json(all);
});

app
  .route("/notification/mark-read")
  .post(jsonParser, async function (req, res) {
    const notificationIds = req.body.notificationIds;
    if (!notificationIds?.length) {
      res.status(400).json({
        message: "invalid request",
      });
      return;
    }
    const filter = { _id: { $in: notificationIds } };

    const update = { isRead: true };
    await Notification.updateMany(filter, update);
    return res.sendStatus(200);
  });
/***************************** LISTEN *****************************/

app.listen(3001, function () {
  console.log("Server started on the port 3001");
});
