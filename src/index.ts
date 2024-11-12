//jshint esversion:6
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import User, { UserType } from "./models/User";
import Card, { CardType } from "./models/Card";
import Project from "./models/Project";
import Label, { LabelType } from "./models/Label";
import Notification from "./models/Notification";
import { WebSocketServer } from "ws";
import Board from "./models/Board";
import Backlog from "./models/Backlog";
import Sprint from "./models/Sprint";
import { Column } from "./models/Column";

function getRandomNumber(min = 1, max = 100000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
dotenv.config();
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/userDB`,
);
const app = express();
app.use(cors());
var jsonParser = bodyParser.json();
const wss = new WebSocketServer({ port: 8080 });

/***************************** / *****************************/
app.route("/").get(async function (req, res) {
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
    try {
      const filter = { email: req.body.email, password: req.body.password };
      const user = await User.findOne(filter);
      if (user === null) {
        res.status(400).json({
          message: "Check your password or email",
        });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: "Check your password or email",
      });
    }
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
    const { title, leadUser, projectKey, boardTitle } = req.body;

    try {
      const newProject = new Project({
        title: title,
        leadUser: leadUser,
        users: [leadUser], // Yeni panoya kullanıcı ekleniyor
        projectKey: projectKey,
        boards: [],
      });
      await newProject.save();

      const board = new Board({
        title: boardTitle ?? `${projectKey} board`,
        users: [leadUser], // Yeni panoya kullanıcı ekleniyor
        projectIds: [newProject._id],
      });

      await board.save();

      newProject.boards = [board._id];
      await newProject.save();

      // Kullanıcının projeject dizisine panoyu ekleyin
      const user = await User.findById(leadUser);
      user?.projects.push(newProject._id);
      await user?.save();

      const projectToReturn = await newProject.populate("boards");
      res.status(201).json({
        message: "Project created successfully",
        project: projectToReturn,
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
    const projects = await Project.find({ users: userId })
      .populate({
        path: "users",
        select: "-password", // Exclude the password field
      })
      .populate("boards")
      .populate({ path: "leadUser", select: "-password -boards -projects" });
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

/***************************** /project/boards/add-user *****************************/
app
  .route("/project/boards/add-user")
  .post(jsonParser, async function (req, res) {
    try {
      const { projectId, boardIds, email } = req.body;

      // Kullanıcının var olup olmadığını kontrol et
      const userMatch = await User.findOne({ email: email });
      if (userMatch === null) {
        return res.status(400).json({
          message: "User not found",
        });
      }
      // Projenin var olup olmadığını kontrol et
      const projectMatch = await Project.findOne({ _id: projectId });
      if (!projectMatch) {
        return res.status(400).json({
          message: "Project not found",
        });
      }
      // Board'ların var olup olmadığını kontrol et
      const boardsMatch = await Board.find({ _id: { $in: boardIds } });
      if (!boardsMatch || boardsMatch.length === 0) {
        return res.status(400).json({
          message: "No boards found",
        });
      }
      // Proje genelinde kullanıcı olup olmadığını kontrol et
      if (projectMatch.users.includes(userMatch._id)) {
        return res.status(400).json({
          message: "User already exists in the project",
        });
      }

      // Her bir board'a kullanıcı ekle
      for (const board of boardsMatch) {
        if (!board.users.includes(userMatch._id)) {
          board.users.push(userMatch._id); // Kullanıcıyı board'a ekle
          await board.save(); // Her board'u ayrı ayrı kaydet
        }
      }

      // Kullanıcıyı projeye ekle
      projectMatch.users.push(userMatch._id);
      await projectMatch.save();

      // Başarılı mesajı dön
      res
        .status(200)
        .json({ message: "User successfully added to boards and project" });
    } catch (err) {
      // Hata durumunda yakala ve hata mesajı döndür
      console.error("Error adding user to boards:", err);
      res.status(500).json({
        message: "An error occurred while adding user to boards",
        error: (err as Error).message,
      });
    }
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

/***************************** /board ******************/
app

  .route("/board")
  .post(jsonParser, async function (req, res) {
    try {
      const { title, userId, projectKeys } = req.body;

      const projects = await Project.find({
        projectKey: { $in: projectKeys },
        users: { $in: userId },
      });

      if (!projects.length) {
        res.status(400).json({
          message: "Projects not found",
        });
        return;
      }
      const newBoard = new Board({
        title: title,
        users: [userId], // Yeni panoya kullanıcı ekleniyor
        projectIds: projects.map((p) => p._id),
      });
      await newBoard.save();

      const initialColumns = [
        { title: "Backlog", status: 0, boardId: newBoard._id },
        { title: "To Do", status: 1, boardId: newBoard._id },
        { title: "In Progress", status: 2, boardId: newBoard._id },
        { title: "Done", status: 3, boardId: newBoard._id },
      ];

      await Column.insertMany(initialColumns);

      const user = await User.findById(userId);
      user?.boards.push(newBoard._id);
      await user?.save();

      for (var i = 0; i < projects.length; i++) {
        var project = projects[i];
        project.boards.push(newBoard.id);
        await project.save();
      }

      res.status(201).json({
        message: "Board created successfully",
        newBoard,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error creating board",
        error: (err as Error).message,
      });
    }
  })
  .get(async function (req, res) {
    const projectKey = req.query.projectKey;
    const userId = req.query.userId;
    //    const projectKey = req.query.projectKey;
    if (!projectKey && !userId) {
      return res
        .status(400)
        .json({ message: "User ID and Project Key is required" });
    }

    const project = await Project.findOne({
      projectKey: projectKey,
      users: userId,
    });

    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    const boards = await Board.find({
      users: userId,
      projectIds: project._id,
    }).populate({
      path: "users",
      select: "-password", // Exclude the password fieldƒ
    });
    res.json(boards);
  });

/***************************** Users in Board *****************************/
app
  .route("/users")

  .get(async function (req, res) {
    try {
      const boardId = req.query.boardId; // boardId string olarak alınmalı
      if (!boardId) {
        return res.status(400).json({ message: "BoardId is required" });
      }
      const board = await Board.findById(boardId).populate<{
        users: UserType[];
      }>("users");

      if (!board) {
        return res
          .status(404)
          .json({ message: "No users found for this board" });
      }
      const filteredUsers = board.users.map((user) => ({
        email: user.email,
        fullName: user.fullName,
        _id: user._id,
      }));
      res.status(200).json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching users" });
    }
  });
/***************************** /backlog *****************************/
app
  .route("/projects/:projectKey/boards/:boardId/backlog")

  .get(async function (req, res) {
    const { boardId, projectKey } = req.params;
    if (!boardId && !projectKey) {
      return res
        .status(400)
        .json({ message: "Board Id and Project Key is required" });
    }

    try {
      let backlog = await Backlog.findOne({ boardId }).populate({
        path: "cardIds", // This is the field you want to populate
        populate: [
          {
            path: "userId", // Populate the userId field in the Card
            model: "User", // Specify the model name for userId
          },
          {
            path: "labels", // Populate the labels field in the Card
            model: "Label", // Specify the model name for labels
          },
        ],
      });

      if (backlog) {
        res.json(backlog?.cardIds);
        return;
      }

      backlog = new Backlog({
        boardId: boardId,
        cardIds: [],
      });

      await backlog.save();
      res.json([]);
      return;
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching cards" });
    }
  });
/***************************** /sprint *****************************/
app
  .route("/sprint")

  .post(jsonParser, async function (req, res) {
    try {
      const { name, sprintGoal, startDate, endDate, boardId, userId } =
        req.body;

      const findBoard = await Board.find({
        _id: boardId,
        users: { $in: userId },
      });
      if (!findBoard) {
        res.status(400).json({
          message: "board not found",
        });
        return;
      }
      const newSprint = new Sprint({
        name: name,
        sprintGoal: sprintGoal,
        startDate: startDate,
        endDate: endDate,
        boardId: boardId,
        userId: userId,
      });

      await newSprint.save();
      res.status(201).json({
        message: "Sprint created successfully",
        newSprint,
      });
    } catch (err) {
      res.status(500).json({
        message: "Error creating board",
        error: (err as Error).message,
      });
    }
  })
  .get(async function (req, res) {
    const boardId = req.query.boardId;
    if (!boardId) {
      return res.status(400).json({ message: "BoardId is required" });
    }

    try {
      const sprints = await Sprint.find({ boardId }).populate({
        path: "cardIds", // This is the field you want to populate
        populate: [
          {
            path: "userId", // Populate the userId field in the Card
            model: "User", // Specify the model name for userId
          },
        ],
      });

      res.json(sprints);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching cards" });
    }
  })
  .put(jsonParser, async function (req, res) {
    const sprintId = req.body.sprintId as string | undefined;
    const boardId = req.body.boardId;
    try {
      // Update the selected sprint to active: true
      const filter = { _id: sprintId };
      const update = { active: true };
      const updatedSprint = await Sprint.findOneAndUpdate(filter, update, {
        new: true,
      }).populate("cardIds");

      // Set active: false for all other sprints
      const updateInactiveSprints = await Sprint.updateMany(
        { _id: { $ne: sprintId }, boardId: boardId }, // Filter to exclude the active sprint
        { active: false },
      );

      res.status(200).json({
        message: "Sprint updated successfully",
        updatedSprint,
        updateInactiveSprints,
      });
    } catch (error) {
      res.status(500).json({ message: "An error occurred", error });
    }
  });

/***************************** Active Sprint *****************************/
app
  .route("/projects/:projectKey/boards/:boardId")

  .get(async function (req, res) {
    const { boardId, projectKey } = req.params;
    if (!boardId && !projectKey) {
      return res
        .status(400)
        .json({ message: "Board Id and Project Key is required" });
      return;
    }

    try {
      let sprint = await Sprint.findOne({ active: true, boardId })
        .populate({
          path: "cardIds",
          populate: [
            {
              path: "userId",
              model: "User",
            },
            {
              path: "labels",
              model: "Label",
            },
          ],
        })
        .populate({
          path: "boardId",
          select: "title",
        });

      if (sprint) {
        return res.json(sprint);
      }
      return res
        .status(400)
        .json({ message: "Board Id and Project Key is required" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching cards" });
    }
  });

/***************************** /column *****************************/

app
  .route("/column")

  .post(jsonParser, async function (req, res) {})

  .get(async function (req, res) {
    const projectKey = req.query.projectKey;
    const boardId = req.query.boardId;

    try {
      const column = await Column.find({ boardId }).populate("cardIds");
      res.json(column);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching columns" });
    }
  });
/***************************** /card *****************************/
app
  .route("/card")

  .post(jsonParser, async function (req, res) {
    try {
      const { content, projectKey, status, userId, boardId, sprintId } =
        req.body;

      const project = await Project.findOne({
        projectKey: projectKey,
        users: { $in: userId },
        boards: { $in: boardId },
      });

      if (!project) {
        res.status(400).json({
          message: "Projects not found",
        });
        return;
      }

      const existingCards = await Card.find({ projectKey });
      const cardKeyNumber = existingCards.length + 1;
      const cardKey = `${projectKey}-${cardKeyNumber}`;
      // const cardKeyNumber = getRandomNumber(1, 100000);
      // const cardKey = `${projectKey}-${cardKeyNumber}`;

      const newCard = new Card({
        userId: userId,
        content: content,
        projectKey: projectKey,
        status: status,
        boardId: boardId,
        cardKey: cardKey,
      });

      await newCard.save();
      if (sprintId) {
        const selectedSprint = await Sprint.findOne({ _id: sprintId });
        selectedSprint?.cardIds.push(newCard._id);
        await selectedSprint?.save();
      } else {
        const backlog = await Backlog.findOne({ boardId: boardId });
        backlog?.cardIds.push(newCard._id);
        await backlog?.save();
      }

      let cardToReturn = await newCard.populate("userId");
      cardToReturn = await cardToReturn.populate("labels");

      res.json(cardToReturn.toJSON());
    } catch (err) {
      res.status(500).json({
        message: "Error creating card",
        error: (err as Error).message,
      });
    }
  })
  .get(async function (req, res) {
    const boardId = req.query.boardId;
    if (!boardId) {
      return res.status(400).json({ message: "BoardId is required" });
    }

    try {
      const cards = await Card.find({ boardId })
        .populate("labels")
        .populate("userId");

      res.json(cards);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching cards" });
    }
  })

  .put(jsonParser, async function (req, res) {
    const oldSprintId = req.body.oldSprintId as string | undefined;
    const newSprintId = req.body.newSprintId as string | undefined;
    const cardId = req.body.cardId;
    const boardId = req.body.boardId as string | undefined;
    const status = req.body.status;
    /****** update Status ******/

    const filter = { _id: cardId };
    const update = { status: status };

    const updatedCard = await Card.findOneAndUpdate(filter, update, {
      new: true,
    })
      .populate("labels")
      .populate("userId");

    /****** Sprint to Backlog ******/
    if (!newSprintId) {
      const findBacklog = await Backlog.findOne({ boardId });
      findBacklog?.cardIds.push(cardId);
      await findBacklog?.save();
      const oldSprint = await Sprint.findById(oldSprintId);

      if (oldSprint) {
        oldSprint.cardIds = oldSprint.cardIds.filter(
          (card) => card._id !== cardId,
        );
        await oldSprint.save();
      }
    }

    /****** Backlog to Sprint ******/
    if (newSprintId && !oldSprintId) {
      const newSprint = await Sprint.findById(newSprintId);
      const backlog = await Backlog.findOne({ boardId });

      if (newSprint) {
        if (!newSprint.cardIds.includes(cardId)) {
          newSprint.cardIds.push(cardId);
        }
        if (backlog) {
          backlog.cardIds = backlog?.cardIds.filter(
            (card) => card.toString() !== cardId.toString(),
          );

          await backlog.save();
        }
      }
      await newSprint?.save();
    }
    /****** Sprint to Sprint ******/
    if (newSprintId && oldSprintId) {
      const newSprint = await Sprint.findById(newSprintId);
      const oldSprint = await Sprint.findById(oldSprintId);

      if (newSprint && oldSprint) {
        if (!newSprint.cardIds.includes(cardId)) {
          newSprint.cardIds.push(cardId);
        }
        if (oldSprint) {
          oldSprint.cardIds = oldSprint?.cardIds.filter(
            (card) => card.toString() !== cardId.toString(),
          );
          await oldSprint.save();
        }
        await newSprint.save();
      }
    }
    res.json(updatedCard?.toJSON());
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
      .populate<{ labels: LabelType[] }>("labels")
      .populate<{ userId: UserType }>("userId");

    if (!card) {
      res.status(400).json({
        message: "Card not found",
      });
      return;
    }

    const labelExists = card.labels?.find((label) => label.colour === colour);
    if (labelExists) {
      /* remove label */
      if (!add) {
        card.labels = card.labels.filter(
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

    card.labels.push(newLabel);
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
