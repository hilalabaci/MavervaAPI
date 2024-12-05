import { Request, Response } from "express";
import Backlog from "../models/Backlog";
import Sprint from "../models/Sprint";
import Card from "../models/Card";
import Project from "../models/Project";
import Label from "../models/Label";

export const addCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, projectKey, status, userId, boardId, sprintId } = req.body;

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
};

export const getCards = async (req: Request, res: Response): Promise<void> => {
  const boardId = req.query.boardId;
  if (!boardId) {
    res.status(400).json({ message: "BoardId is required" });
    return;
  }

  try {
    const cards = await Card.find({ boardId })
      .populate("labels")
      .populate("userId");

    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching cards" });
  }
};

export const updateCardContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const cardId = req.body.cardId;
    const newContent = req.body.newContent;

    const filter = { _id: cardId };
    const update = { content: newContent };
    const updatedCard = await Card.findOneAndUpdate(filter, update, {
      new: true,
    })
      .populate("labels")
      .populate("userId");

    res.json(updatedCard?.toJSON());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching cards" });
  }
};
export const updateCard = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
};

export const deleteCard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.query.id;
  await Card.deleteOne({ _id: id });
  await Label.deleteMany({ cardId: id });
  res.sendStatus(200);
};
