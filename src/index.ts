//jshint esversion:6
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import User from "./models/User";
import Card from "./models/Card";
import Board from "./models/Board";
import Label, { LabelType } from "./models/Label";
import Notification from "./models/Notification";

dotenv.config();

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/userDB`,
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
    await user.save();
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
    const { title, userId, projectKey } = req.body;

    const newBoard = new Board({
      title: title,
      users: [userId], // Yeni panoya kullanıcı ekleniyor
      projectKey: projectKey,
    });

    await newBoard.save();

    // Kullanıcının boards dizisine panoyu ekleyin
    const user = await User.findById(userId);
    user?.boards.push(newBoard._id);
    await user?.save();

    res.json(newBoard);
  })

  .get(async function (req, res) {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const boards = await Board.find({ users: userId }).populate({
      path: "users",
      select: "-password", // Exclude the password field
    });
    res.json(boards);
  })

  .patch(jsonParser, async function (req, res) {
    const filter = { _id: req.body.id };
    const update = { title: req.body.title };
    const boardTitle = await Board.findOneAndUpdate(filter, update, {
      new: true,
    });
    res.json(boardTitle?.toJSON());
  })

  .delete(async function (req, res) {
    const id = req.query.id;
    const filter = { boardId: id };
    await Card.deleteMany(filter);
    await Board.deleteOne({ _id: id });
    res.sendStatus(200);
  });

app.route("/board/add-user").post(jsonParser, async function (req, res) {
  const { boardId, email, userId } = req.body;
  const userMatch = await User.findOne({ email: email });
  if (userMatch === null) {
    res.status(400).json({
      message: "User not found",
    });
    return;
  }
  const boardMatch = await Board.findOne({ _id: boardId });
  if (!boardMatch) {
    res.status(400).json({
      message: "Board not found",
    });
    return;
  }
  // Check if the user is already associated with the board
  if (boardMatch.users.includes(userMatch._id)) {
    return res
      .status(400)
      .json({ message: "User already exists in the board" });
  }

  // Add the user to the board's users array
  boardMatch.users.push(userMatch._id);
  await boardMatch.save();

  /***************************** notification/post *****************************/

  const newNotification = new Notification({
    fromUserId: userId,
    toUserId: userMatch._id,
    message: `Added you to the board ${boardMatch.title}`,
  });

  await newNotification.save();

  res.json(boardMatch.toJSON());
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

    let cardToReturn = await newCard.populate("userId");
    cardToReturn = await cardToReturn.populate("labels");
    res.json(cardToReturn.toJSON());
  })
  .get(async function (req, res) {
    const filter = { boardId: req.query.boardId };
    const all = await Card.find(filter).populate("labels").populate("userId");
    res.json(all);
  })

  .patch(jsonParser, async function (req, res) {
    const filter = { _id: req.body.id };
    const update = { status: req.body.status };
    const card = await Card.findOneAndUpdate(filter, update, {
      new: true,
    })
      .populate("labels")
      .populate("userId");
    res.json(card?.toJSON());
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
    const card = await Card.findById(cardId)
      .populate("labels")
      .populate("userId");

    if (!card) {
      res.status(400).json({
        message: "Card not found",
      });
      return;
    }

    const labelExists = (card.labels as LabelType[])?.find(
      (label) => label.colour === colour,
    );
    if (labelExists) {
      /* remove label */
      if (!add) {
        card.labels = (card.labels as LabelType[]).filter(
          (label) => label._id !== labelExists._id,
        );
        await card.save();
        await Label.deleteOne({ _id: labelExists._id });
        const cardToReturn = await card.populate("labels");
        res.json(cardToReturn);
        return;
      }

      res.json(card);
      return;
    }

    if (!labelExists && !add) {
      res.json(card);
      return;
    }
    /* Add label */
    const newLabel = new Label({
      colour: colour,
      cardId: cardId,
    });
    await newLabel.save();

    (card.labels as mongoose.Types.ObjectId[]).push(newLabel._id);
    await card.save();
    let cardsToReturn = await card.populate("labels");
    cardsToReturn = await cardsToReturn.populate("userId");
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
