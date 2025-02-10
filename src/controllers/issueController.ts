import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, projectKey, status, userId, boardId, sprintId } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        Key: projectKey,
        Users: { some: { Id: userId } },
        Boards: { some: { Id: boardId } },
      },
    });

    if (!project) {
      res.status(400).json({
        message: "Projects not found",
      });
      return;
    }

    const existingIssues = await prisma.issue.findMany({
      where: {
        Key: projectKey,
      },
    });
    const issueKeyNumber = existingIssues.length + 1;
    const cardKey = `${projectKey}-${issueKeyNumber}`;
    const column = await prisma.column.findFirst({
      where: {
        BoardId: boardId, // Board içinde arama yapıyoruz
        Status: status, // İlgili statüye sahip column'u buluyoruz
      },
    });

    if (!column) {
      res
        .status(400)
        .json({ message: "Column not found for the given board and status" });
      return;
    }

    // const cardKeyNumber = getRandomNumber(1, 100000);
    // const cardKey = `${projectKey}-${cardKeyNumber}`;

    const newIssue = await prisma.issue.create({
      data: {
        UserId: userId,
        Summary: content,
        ProjectKey: projectKey,
        Status: status,
        BoardId: boardId,
        Key: cardKey,
        Project: {
          connect: { Id: project.Id },
        },
        Column: {
          connect: { Id: column.Id },
        },
      },
    });
    if (sprintId) {
      await prisma.sprint.update({
        where: { Id: sprintId },
        data: {
          Issues: {
            connect: { Id: newIssue.Id },
          },
        },
      });
    } else {
      await prisma.backlog.update({
        where: { Id: boardId },
        data: {
          Issues: {
            connect: { Id: newIssue.Id },
          },
        },
      });
    }
    res.json(newIssue);
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
    const issues = await prisma.issue.findMany({
      where: { BoardId: boardId as string },
    });
    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cards" });
  }
};

export const updateCardContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cardId, newContent } = req.body;
    const updatedIssue = await prisma.issue.update({
      where: { Id: cardId },
      data: { Summary: newContent },
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating card content" });
  }
};
export const updateCard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { oldSprintId, newSprintId, cardId, boardId, status } = req.body;

    const updatedIssue = await prisma.issue.update({
      where: { Id: cardId },
      data: { Status: status },
    });

    /****** Sprint to Backlog ******/
    if (!newSprintId) {
      await prisma.backlog.update({
        where: { BoardId: boardId },
        data: { Issues: { connect: { Id: cardId } } },
      });

      if (oldSprintId) {
        await prisma.sprint.update({
          where: { Id: oldSprintId },
          data: { Issues: { disconnect: { Id: cardId } } },
        });
      }
      /****** Backlog to Sprint ******/
      if (newSprintId && !oldSprintId) {
        await prisma.sprint.update({
          where: { Id: newSprintId },
          data: { Issues: { connect: { Id: cardId } } },
        });
        await prisma.backlog.update({
          where: { BoardId: boardId },
          data: { Issues: { disconnect: { Id: cardId } } },
        });
      }
      /****** Sprint to Sprint ******/
      if (newSprintId && oldSprintId) {
        await prisma.sprint.update({
          where: { Id: newSprintId },
          data: { Issues: { connect: { Id: cardId } } },
        });
        await prisma.sprint.update({
          where: { Id: oldSprintId },
          data: { Issues: { disconnect: { Id: cardId } } },
        });
      }
      res.json(updatedIssue);
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating card", error });
  }
};

export const deleteCard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.query;

    await prisma.issue.delete({ where: { Id: id as string } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error deleting card", error });
  }
};
