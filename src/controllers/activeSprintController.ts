import { Request, Response } from "express";
import Sprint from "../models/Sprint";

export const getActiveSprint = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { boardId, projectKey } = req.params;
  if (!boardId && !projectKey) {
    res.status(400).json({ message: "Board Id and Project Key is required" });
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
      res.json(sprint);
      return;
    }
    res.status(400).json({ message: "Board Id and Project Key is required" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching cards" });
  }
};
