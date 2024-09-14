//jshint esversion:6
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import User from "./models/User";
import Card from "./models/Card";
import Project from "./models/Project";
import Label, { LabelType } from "./models/Label";
import Notification from "./models/Notification";
import { WebSocketServer } from "ws";
dotenv.config();

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/userDB`,
);
const app = express();
app.use(cors());
var jsonParser = bodyParser.json();
const wss = new WebSocketServer({ port: 8080 });

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

/***************************** /project *****************************/

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Mesaj dinleme
  ws.on("message", async (message: string) => {
    const data = JSON.parse(message);
    let projectKey = "";
    const chars = data.title.split(" ") ?? ["Undefined"];
    if (chars.length === 1) {
      projectKey = (
        (chars?.[0]?.[0] ?? "") +
        (chars?.[0]?.[1] ?? "") +
        (chars?.[0]?.[2] ?? "")
      ).toUpperCase();
    } else {
      let newKey = "";
      let i = 0;
      while (i < chars.length) {
        newKey = newKey + chars[i][0];
        i++;
      }
      projectKey = newKey.toUpperCase();
    }

    let isKeyUnique = false;
    let uniqueKey = projectKey;
    let suffix = 1;
    while (!isKeyUnique) {
      const existingProject = await Project.findOne({ projectKey: uniqueKey });
      if (!existingProject) {
        isKeyUnique = true;
      } else {
        // Eğer aynı key varsa, sonuna bir sayı ekleyerek benzersiz yap
        uniqueKey = `${projectKey}${suffix}`;
        suffix++;
      }
    }
    ws.send(JSON.stringify({ projectKey: uniqueKey }));
    sendProjectKeyToClient(uniqueKey);
  });

  // Project oluşturulduğunda mesaj gönder
  const sendProjectKeyToClient = (key: string) => {
    ws.send(JSON.stringify({ message: "Unique Key Created", projectKey: key }));
  };
});
app
  .route("/project")

  .post(jsonParser, async function (req, res) {
    const { title, userId, projectKey } = req.body;
    const newProject = new Project({
      title: title,
      users: [userId], // Yeni panoya kullanıcı ekleniyor
      projectKey: projectKey,
    });

    // Kullanıcının projeject dizisine panoyu ekleyin
    const user = await User.findById(userId);
    user?.projects.push(newProject._id);
    await user?.save();

    try {
      await newProject.save();
      res.status(201).json({
        message: "Project created successfully",
        newProject,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error creating project",
        error: (err as Error).message,
      });
    }
  })

  .get(async function (req, res) {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const projects = await Project.find({ users: userId }).populate({
      path: "users",
      select: "-password", // Exclude the password field
    });
    res.json(projects);
  })

  .patch(jsonParser, async function (req, res) {
    const filter = { _id: req.body.id };
    const update = { title: req.body.title };
    const projectTitle = await Project.findOneAndUpdate(filter, update, {
      new: true,
    });
    res.json(projectTitle?.toJSON());
  })

  .delete(async function (req, res) {
    const id = req.query.id;
    const filter = { projectId: id };
    await Card.deleteMany(filter);
    await Project.deleteOne({ _id: id });
    res.sendStatus(200);
  });

app.route("/project/add-user").post(jsonParser, async function (req, res) {
  const { projectId, email, userId } = req.body;
  const userMatch = await User.findOne({ email: email });
  if (userMatch === null) {
    res.status(400).json({
      message: "User not found",
    });
    return;
  }
  const projectMatch = await Project.findOne({ _id: projectId });
  if (!projectMatch) {
    res.status(400).json({
      message: "Project not found",
    });
    return;
  }
  // Check if the user is already associated with the project
  if (projectMatch.users.includes(userMatch._id)) {
    return res
      .status(400)
      .json({ message: "User already exists in the project" });
  }

  // Add the user to the project's users array
  projectMatch.users.push(userMatch._id);
  await projectMatch.save();

  /***************************** notification/post *****************************/

  const newNotification = new Notification({
    fromUserId: userId,
    toUserId: userMatch._id,
    message: `Added you to the project ${projectMatch.title}`,
  });

  await newNotification.save();

  res.json(projectMatch.toJSON());
});

/***************************** /projects/:projectKey *****************************/

app
  .route("/projects/:projectKey")

  .get(async function (req, res) {
    const { projectKey } = req.params;
    try {
      const project = await Project.findOne({ projectKey }).populate({
        path: "users",
        select: "-password", // Parola alanını dışla
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching project",
        error: (error as Error).message,
      });
    }
  });
/***************************** /card *****************************/
app
  .route("/card")

  .post(jsonParser, async function (req, res) {
    const { content, projectKey, status, userId } = req.body;
    const newCard = new Card({
      userId: userId,
      content: content,
      projectKey: projectKey,
      status: status,
    });
    await newCard.save();

    let cardToReturn = await newCard.populate("userId");
    cardToReturn = await cardToReturn.populate("labels");
    res.json(cardToReturn.toJSON());
  })
  .get(async function (req, res) {
    const filter = { projectKey: req.query.projectKey };
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
