import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    const sprint = await prisma.sprint.findFirst({
      where: {
        BoardId: boardId,
        IsActive: true,
      },
      include: {
        Issues: {
          include: {
            UserIssues: {
              include: {
                User: {
                  select: {
                    FullName: true,
                    Email: true,
                  },
                },
              },
            },
            Label: true,
          },
        },
        Board: {
          select: {
            Name: true,
          },
        },
      },
    });

    if (sprint) {
      res.json({
        ...sprint,
        Issues: sprint.Issues.map((issue) => {
          return {
            ...issue,
            Users: issue.UserIssues.map((user) => user.User),
          };
        }),
      });
      return;
    }
    res.status(400).json({ message: "Active sprint not found" });
    return;
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching sprint" });
  }
};
