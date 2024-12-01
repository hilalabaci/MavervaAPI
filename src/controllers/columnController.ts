import { Request, response, Response } from "express";
import { Column } from "../models/Column";
import Board from "../models/Board";
import Card from "../models/Card";

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
export const addColumn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, boardId } = req.body;

    const board = await Board.findById(boardId);

    if (!board) {
      res.status(400).json({
        message: "Projects not found",
      });
      return;
    }

    const columns = await Column.find({ boardId: boardId });
    const highestStatusColumn = columns
      .filter((c) => c.status !== 99)
      .sort((a, b) => b.status - a.status)[0];

    // Determine the new status number
    const newStatusNumber = highestStatusColumn
      ? highestStatusColumn.status + 1
      : 0;

    const newColumn = new Column({
      title: title,
      status: newStatusNumber,
      boardId: boardId,
    });

    await newColumn.save();
    res.status(201).json(newColumn);
  } catch (err) {
    res.status(500).json({
      message: "Error creating card",
      error: (err as Error).message,
    });
  }
};

export const deleteColumn = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const columnId = req.query.columnId;
    const findColumn = await Column.findById(columnId);
    if (!findColumn) {
      res.status(404).send("Column not found");
      return;
    }
    const columnStatus = findColumn?.status;
    const boardId = findColumn.boardId;
    const findColumnCards = await Card.find({
      status: columnStatus,
      boardId: boardId,
    });
    const updateResult = await Card.updateMany(
      { _id: { $in: findColumnCards } },
      { status: 0 },
    );
    if (updateResult.modifiedCount === 0) {
      console.log("No cards were updated.");
    } else {
      console.log(`${updateResult.modifiedCount} cards updated.`);
    }
    await Column.deleteOne({ _id: columnId });
    res.status(200).send(findColumnCards);
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).send("Internal server error");
  }
};
