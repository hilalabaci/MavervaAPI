import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, sprintGoal, startDate, endDate, boardId, userId } = req.body;

    const foundBoards = await prisma.board.findMany({
      where: {
        Id: boardId,
        UserBoards: { some: { UserId: userId } },
      },
    });
    if (!foundBoards.length) {
      res.status(400).json({
        message: "board not found",
      });
      return;
    }

    const newSprint = await prisma.sprint.create({
      data: {
        Name: name,
        SprintGoal: sprintGoal,
        StartDate: startDate,
        EndDate: endDate,
        BoardId: boardId,
      },
    });

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
    const sprints = await prisma.sprint.findMany({
      where: {
        BoardId: boardId as string,
      },
      include: {
        Issues: {
          include: {
            Backlog: true,
            Board: true,
            Column: true,
            Label: true,
            Sprint: true,
            UserIssues: true,
          },
        },
      },
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

    const updatedSprint = await prisma.sprint.update({
      where: { Id: sprintId },
      data: { IsActive: true },
      include: { Issues: true },
    });

    // Set active: false for all other sprints
    const updateInactiveSprints = await prisma.sprint.updateMany({
      where: {
        Id: { not: sprintId },
        BoardId: boardId,
      },
      data: { IsActive: false },
    });

    res.status(200).json({
      message: "Sprint updated successfully",
      updatedSprint,
      updateInactiveSprints,
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};
