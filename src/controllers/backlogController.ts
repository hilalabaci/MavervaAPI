import { Request, Response } from "express";
import Backlog from "../models/Backlog";

export const getBacklog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { boardId, projectKey } = req.params;
  if (!boardId && !projectKey) {
    res.status(400).json({ message: "Board Id and Project Key is required" });
    return;
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
    res.status(500).json({ message: "An error occurred while fetching cards" });
  }
};
