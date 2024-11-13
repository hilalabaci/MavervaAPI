import { Request, Response } from "express";
import { Column } from "../models/Column";

export const getColumn = async (req: Request, res: Response): Promise<void> => {
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
};
