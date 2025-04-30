import { Request, Response } from "express";
import { prisma } from "../utils/prisma";


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
    let backlog = await prisma.backlog.findUnique({
      where: {
        BoardId: boardId,
      },
      include: {
        Issues: {
          select: {
            Id: true,
            Label: true,
            Summary: true,
            Status: true,
            Key: true,
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
          },
        },
      },
    });
    if (backlog) {
      res.json(backlog.Issues);
      return;
    }
    return;
  } catch (error) {
    console.error("Error fetching backlog:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching backlog" });
  }
};
