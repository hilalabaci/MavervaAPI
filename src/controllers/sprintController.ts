import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const addSprint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId, userId } = req.body;
    const board = await prisma.board.findFirst({
      where: {
        Id: boardId,
        UserBoards: { some: { UserId: userId, Role: "Admin" } },
      },
    });
    if (!board) {
      res.status(400).json({
        message: "You do not have permission to add a sprint to this board",
      });
      return;
    }
    const sprints = await prisma.sprint.findMany({
      where: {
        BoardId: boardId,
      },
    });
    const sprintsLenght = sprints.length;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 21);

    const newSprint = await prisma.sprint.create({
      data: {
        Name: `${board.Key} Sprint ${sprintsLenght + 1}`,
        SprintGoal: "",
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
  const { boardId, projectKey } = req.query;
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
            Backlog: { select: { Id: true, Issues: true } },
            Board: true,
            Column: true,
            Label: true,
            Sprint: true,
            AssigneeUser: {
              select: {
                Id: true,
                FullName: true,
                Email: true,
                ProfilePicture: true,
              },
            },
            ReporterUser: {
              select: {
                Id: true,
                FullName: true,
                Email: true,
                ProfilePicture: true,
              },
            },
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
  const {
    boardId,
    sprintId,
    sprintName,
    sprintGoal,
    startDate,
    endDate,
    userId,
  } = req.body;
  //might be 2 scenario
  //1. Make Active Sprint to sprintId
  //2. Change data on sprint
  try {
    if (sprintName || sprintGoal || startDate || endDate) {
      const updatedSprint = await prisma.sprint.update({
        where: { Id: sprintId },
        data: {
          Name: sprintName,
          SprintGoal: sprintGoal,
          StartDate: startDate,
          EndDate: endDate,
        },
        include: { Issues: true },
      });
      res.status(200).json({
        message: "Sprint updated successfully",
        updatedSprint,
      });
    } else {
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
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};
