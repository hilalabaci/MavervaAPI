import { Request, Response } from "express";
import Sprint from "../models/Sprint";
import Board from "../models/Board";

export const addSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, sprintGoal, startDate, endDate, boardId, userId } = req.body;

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
};

export const getSprints = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const boardId = req.query.boardId;
  if (!boardId) {
    res.status(400).json({ message: "BoardId is required" });
    return;
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
    res.status(500).json({ message: "An error occurred while fetching cards" });
  }
};

export const updateSprint = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
};
