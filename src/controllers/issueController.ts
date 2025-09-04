import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const addIssue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, projectKey, status, userId, boardId, sprintId } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        Key: projectKey,
        UserProjects: { some: { UserId: userId } },
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
        ProjectKey: projectKey,
      },
      select: {
        Key: true,
      },
    });

    let issueKeyNumber = 1;
    if (existingIssues.length > 0) {
      const issueNumbers = existingIssues.map((issue) => {
        const keyParts = issue.Key.split("-");
        return parseInt(keyParts[keyParts.length - 1], 10);
      });

      issueKeyNumber = Math.max(...issueNumbers) + 1;
    }
    const cardKey = `${projectKey}-${issueKeyNumber}`;

    if (!sprintId) {
      const newIssue = await prisma.issue.create({
        data: {
          Summary: content,
          ProjectKey: projectKey,
          Status: status,
          Key: cardKey,
          BoardId: boardId,
          ProjectId: project.Id,
          ReporterUserId: userId,
        },
      });

      const backlog = await prisma.backlog.findFirst({
        where: { BoardId: boardId },
      });
      if (!backlog) {
        res
          .status(400)
          .json({ message: "Backlog not found for the given board" });
        return;
      }
      await prisma.backlog.update({
        where: { Id: backlog.Id },
        data: {
          Issues: {
            connect: { Id: newIssue.Id },
          },
        },
      });
      res.json(newIssue);
      return;
    }

    const columnStatus = await prisma.column.findFirst({
      where: {
        BoardId: boardId,
        Status: status,
      },
    });

    if (!columnStatus) {
      res
        .status(400)
        .json({ message: "Column not found for the given board and status" });
      return;
    }
    const newIssue = await prisma.issue.create({
      data: {
        Summary: content,
        ProjectKey: projectKey,
        Status: status,
        Key: cardKey,
        BoardId: boardId,
        ProjectId: project.Id,
        ColumnId: columnStatus.Id,
        ReporterUserId: userId,
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
    }
    res.json(newIssue);
  } catch (err) {
    res.status(500).json({
      message: "Error creating card",
      error: (err as Error).message,
    });
  }
};

export const getIssues = async (req: Request, res: Response): Promise<void> => {
  const boardId = req.query.boardId;
  if (!boardId) {
    res.status(400).json({ message: "BoardId is required" });
    return;
  }
  try {
    const issues = await prisma.issue.findMany({
      where: { BoardId: boardId as string },
      include: {
        ReporterUser: {
          select: {
            Id: true,
            FullName: true,
            Email: true,
            ProfilePicture: true,
          },
        },
        AssigneeUser: {
          select: {
            Id: true,
            FullName: true,
            Email: true,
            ProfilePicture: true,
          },
        },
        Sprint: {
          select: {
            Id: true,
            Name: true,
            StartDate: true,
            EndDate: true,
          },
        },
      },
    });
    res.json(issues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cards" });
  }
};

export const updateIssueContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { issueId, newSummary, newDescription } = req.body;
    const updatedIssue = await prisma.issue.update({
      where: { Id: issueId },
      data: { Summary: newSummary, Description: newDescription },
      include: {
        ReporterUser: {
          select: {
            Id: true,
            FullName: true,
            Email: true,
            ProfilePicture: true,
          },
        },
        AssigneeUser: {
          select: {
            Id: true,
            FullName: true,
            Email: true,
            ProfilePicture: true,
          },
        },
        Sprint: {
          select: {
            Id: true,
            Name: true,
            StartDate: true,
            EndDate: true,
          },
        },
      },
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating card content" });
  }
};
export const updateIssue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    let { oldSprintId, newSprintId, issueId, boardId, status } = req.body;
    const issue = await prisma.issue.findUnique({
      where: { Id: issueId },
      include: {
        Project: true,
        AssigneeUser: true,
        Sprint: true,
      },
    });

    // First, handle the case where only the status is being updated
    if (status && !oldSprintId && !newSprintId) {
      const updatedIssue = await prisma.issue.update({
        where: { Id: issueId },
        data: { Status: Number(status) },
      });
      res.json(updatedIssue);
      return;
    }

    // If both sprint IDs are provided, handle the case where the card moves from one sprint to another
    if (newSprintId && oldSprintId) {
      if (oldSprintId === newSprintId) return;
      // Move the issue from the old sprint to the new sprint
      await prisma.sprint.update({
        where: { Id: newSprintId },
        data: { Issues: { connect: { Id: issueId } } },
      });
      await prisma.sprint.update({
        where: { Id: oldSprintId },
        data: { Issues: { disconnect: { Id: issueId } } },
      });
    }

    // If there's only an old sprint ID, move the card from the sprint to the backlog
    if (!newSprintId && oldSprintId) {
      await prisma.sprint.update({
        where: { Id: oldSprintId },
        data: { Issues: { disconnect: { Id: issueId } } },
      });
      await prisma.backlog.update({
        where: { BoardId: boardId },
        data: { Issues: { connect: { Id: issueId } } },
      });
    }

    // If there's only a new sprint ID, move the card from the backlog to the sprint
    if (newSprintId && !oldSprintId) {
      await prisma.sprint.update({
        where: { Id: newSprintId },
        data: { Issues: { connect: { Id: issueId } } },
      });
      await prisma.backlog.update({
        where: { BoardId: boardId },
        data: { Issues: { disconnect: { Id: issueId } } },
      });
    }

    // Finally, update the status of the card after all the moves
    const updatedIssue = await prisma.issue.findUnique({
      where: { Id: issueId },
    });

    res.json(updatedIssue);
    return;
  } catch (error) {
    // If there's an error during any of the operations, send an error response
    res.status(500).json({ message: "Error updating card", error });
  }
};

export const deleteIssue = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, issueId } = req.body;
    if (!userId) {
      res.status(400).json({ message: "userId is required" });
      return;
    }
    const issue = await prisma.issue.findUnique({
      where: { Id: issueId as string },
      include: {
        AssigneeUser: true,
        Project: true,
      },
    });

    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
      return;
    }
    if (
      issue.ReporterUserId !== userId &&
      !["projectLead", "projectManager"].includes(issue.Project.LeadUserId)
    ) {
      res.status(403).json({
        message: "You do not have permission to delete this issue",
      });
      return;
    }
    await prisma.issue.delete({ where: { Id: issueId as string } });

    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting card", error });
  }
};
