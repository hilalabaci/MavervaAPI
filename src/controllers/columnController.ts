import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getColumn = async (req: Request, res: Response): Promise<void> => {
  const boardId = req.query.boardId;
  try {
    const columns = await prisma.column.findMany({
      where: {
        BoardId: boardId as string,
      },
      include: { Issues: true },
    });
    res.json(columns);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching columns" });
  }
};
export const addColumn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, boardId, userId } = req.body;

    const userInBoard = await prisma.userBoard.findFirst({
      where: {
        BoardId: boardId as string,
        UserId: userId as string,
        Role: "Admin",
      },
    });
    if (!userInBoard) {
      res
        .status(403)
        .json({ message: "You do not have permission to add columns" });
      return;
    }

    const board = await prisma.board.findUnique({
      where: {
        Id: boardId,
      },
    });

    if (!board) {
      res.status(400).json({
        message: "Projects not found",
      });
      return;
    }

    const columns = await prisma.column.findMany({
      where: { BoardId: boardId },
    });
    const highestStatusColumn = columns
      .filter((c) => c.Status !== 99)
      .sort((a, b) => b.Status - a.Status)[0];

    // Determine the new status number
    const newStatusNumber = highestStatusColumn
      ? highestStatusColumn.Status + 1
      : 0;

    const newColumn = await prisma.column.create({
      data: {
        Name: title,
        Status: newStatusNumber,
        BoardId: boardId,
      },
    });

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
    const { columnId } = req.query;
    const userId = req.body.userId;

    const column = await prisma.column.findUnique({
      where: { Id: columnId as string },
    });
    if (!column) {
      res.status(404).json({ message: "Column not found" });
      return;
    }

    const boardId = column.BoardId;

    const userBoard = await prisma.userBoard.findFirst({
      where: { UserId: userId, BoardId: boardId, Role: "Admin" },
    });
    if (!userBoard) {
      res
        .status(403)
        .json({ message: "You do not have permission to delete columns" });
      return;
    }

    const columnStatus = column?.Status;

    const updatedCards = await prisma.issue.updateMany({
      where: { Status: columnStatus, BoardId: boardId },
      data: { Status: 0 },
    });
    await prisma.column.delete({ where: { Id: columnId as string } });
    res
      .status(200)
      .json({ message: "Column deleted", updatedCards })
      .send(updatedCards);
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).send("Internal server error");
  }
};
