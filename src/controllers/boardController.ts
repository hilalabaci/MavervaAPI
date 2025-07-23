import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

//ADD BOARD
export const addBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, userId, projectKeys } = req.body;

    const projects = await prisma.project.findMany({
      where: {
        Key: { in: projectKeys },
        UserProjects: { some: { UserId: userId } },
      },
    });

    if (!projects.length) {
      res.status(400).json({
        message:
          "Projects not found or user does not have access to the project",
      });
      return;
    }
    const user = await prisma.userProject.findFirst({
      where: { UserId: userId },
      select: { Role: true },
    });
    if (user?.Role !== "Admin") {
      res.status(403).json({
        message: "You do not have permission to add a board",
      });
      return;
    }

    const newBoard = await prisma.board.create({
      data: {
        Name: title,
        Project: { connect: { Id: projects[0].Id } },
        LeadUserId: userId,
        Key: `${projectKeys[0]}-${title}`,
        //projects: { connect: projects.map((p) => ({ id: p.Id })) },
      },
    });

    await prisma.userBoard.create({
      data: {
        UserId: userId,
        BoardId: newBoard.Id,
        Role: "Admin",
        ProjectId: projects[0].Id,
      },
    });

    await prisma.column.createMany({
      data: [
        { Name: "To Do", Status: 1, BoardId: newBoard.Id },
        { Name: "In Progress", Status: 2, BoardId: newBoard.Id },
        { Name: "Done", Status: 99, BoardId: newBoard.Id },
      ],
    });
    await prisma.backlog.create({
      data: {
        BoardId: newBoard.Id,
      },
    });
    await prisma.sprint.create({
      data: {
        Name: `${newBoard.Key} Sprint 1`,
        BoardId: newBoard.Id,
        IsActive: true,
        StartDate: new Date(),
        EndDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Sprint ends in 2 weeks
      },
    });
    res.status(201).json({ message: "Board created successfully", newBoard });
    // const user = await User.findById(userId);
    // user?.boards.push(newBoard._id);
    // await user?.save();

    // for (var i = 0; i < projects.length; i++) {
    //   var project = projects[i];
    //   project.boards.push(newBoard.id);
    //   await project.save();
    // }
  } catch (err) {
    res.status(500).json({
      message: "Error creating board",
      error: (err as Error).message,
    });
  }
};
// GET BOARD
export const getBoards = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectKey = req.query.projectKey;
    const userId = req.query.userId as string;

    if (!projectKey && !userId) {
      res.status(400).json({ message: "User ID and Project Key is required" });
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        Key: projectKey as string,
        UserProjects: { some: { UserId: userId } },
      },
      select: { Id: true },
    });

    if (!project) {
      res.status(400).json({ message: "Project not found" });
      return;
    }
    // Check if the user has a valid role
    const user = await prisma.userProject.findFirst({
      where: { UserId: userId, ProjectId: project.Id },
      select: { Role: true },
    });
    if (
      user?.Role.toLowerCase() !== "admin" &&
      user?.Role.toLowerCase() !== "member" &&
      user?.Role.toLowerCase() !== "viewer"
    ) {
      res
        .status(403)
        .json({ message: "You do not have permission to view boards" });
      return;
    }

    const boards = await prisma.board.findMany({
      where: {
        UserBoards: {
          some: {
            UserId: userId,
            ProjectId: project.Id,
          },
        },
      },
      include: {
        UserBoards: {
          include: {
            User: { select: { Id: true, Email: true, FullName: true } },
          },
        },
        Sprints: {
          where: { IsActive: true },
          select: { Id: true },
        },
      },
    });

    res.json(
      boards.map((board) => ({
        ...board,
        Users: board.UserBoards.map((ub) => ub.User),
      })),
    );
  } catch (err) {
    res.status(500).json({
      message: "Error fetching boards",
      error: (err as Error).message,
    });
  }
};
//Check if the User exist.
export const addUserToBoard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId, boardIds, email, userId, role } = req.body;
    if (!projectId || !boardIds || !email || !userId || !role) {
      res.status(400).json({
        message: "ProjectId, BoardIds, Email, UserId and Role are required",
      });
      return;
    }
    const addedUser = await prisma.user.findFirst({
      where: { Email: email },
    });

    if (!addedUser) {
      res.status(400).json({
        message: " Added User not found",
      });
      return;
    }

    const userProject = await prisma.userProject.findFirst({
      where: { ProjectId: projectId, UserId: userId },
      select: { Role: true },
    });

    if (!userProject) {
      res.status(400).json({
        message: "Project not found",
      });
      return;
    }

    if (userProject.Role.toLowerCase() !== "admin") {
      res.status(403).json({
        message: "You do not have permission to add users to boards",
      });
      return;
    }

    // Check if the boards exist.
    const boards = await prisma.board.findMany({
      where: { Id: { in: boardIds }, ProjectId: projectId },
      select: { Id: true, Name: true },
    });

    if (!boards.length) {
      res.status(400).json({
        message: "No boards found",
      });
      return;
    }

    await Promise.all(
      boards.map((board) =>
        prisma.userBoard.create({
          data: {
            UserId: addedUser.Id,
            BoardId: board.Id,
            Role: role,
            ProjectId: projectId,
          },
        }),
      ),
    );
    const project = await prisma.userProject.findFirst({
      where: { ProjectId: projectId, UserId: addedUser.Id },
    });

    if (!project) {
      await prisma.userProject.create({
        data: {
          ProjectId: projectId,
          UserId: addedUser.Id,
          Role: "Viewer",
        },
      });
    }

    const projectFind = await prisma.project.findUnique({
      where: { Id: projectId },
      select: { Name: true },
    });
    const user = await prisma.user.findUnique({
      where: { Id: userId },
      select: { FullName: true },
    });
    const boardNames = boards.map((b) => b.Name).join(", ");
    const projectName = projectFind?.Name || "a project";

    // Create a notification for the added user
    await prisma.notification.create({
      data: {
        ToUserId: addedUser.Id,
        FromUserId: userId,
        Message: `You have been added as a ${role} to the ${boardNames} board of the ${projectName} project by ${user?.FullName}`,
        IsRead: false,
        CreatedAt: new Date(),
      },
    });
    res
      .status(200)
      .json({ message: "User successfully added to boards and project" });
  } catch (err) {
    // Hata durumunda yakala ve hata mesajı döndür
    console.error("Error adding user to boards:", err);
    res.status(500).json({
      message: "An error occurred while adding user to boards",
      error: (err as Error).message,
    });
  }
};

// GET USERS FROM BOARD
export const getUsersToBoard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { boardId, userId } = req.query;
    if (!boardId || !userId) {
      res.status(400).json({ message: "BoardId is required" });
      return;
    }
    const userBoard = await prisma.userBoard.findFirst({
      where: { BoardId: boardId as string, UserId: userId as string },
      include: {
        Board: {
          select: {
            UserBoards: {
              include: {
                User: {
                  select: {
                    Id: true,
                    Email: true,
                    FullName: true,
                    ProfilePicture: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!userBoard || !userBoard.Board) {
      res
        .status(403)
        .json({ message: "You do not have permission to view this board" });
      return;
    }
    const role = userBoard.Role.toLowerCase();
    if (!["admin", "member", "viewer"].includes(role)) {
      res.status(403).json({
        message: "You do not have permission to view users for this board",
      });
      return;
    }
    res
      .status(200)
      .json({ users: userBoard.Board.UserBoards.map((ub) => ub.User) });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "An error occurred while fetching users" });
  }
};
