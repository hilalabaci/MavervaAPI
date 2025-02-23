import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//ADD BOARD
export const addBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, userId, projectKeys } = req.body;

    const projects = await prisma.project.findMany({
      where: {
        Key: { in: projectKeys },
        Users: { some: { Id: userId } },
      },
    });

    if (!projects.length) {
      res.status(400).json({
        message:
          "Projects not found or user does not have access to the project",
      });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { Id: userId },
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
        Users: { connect: { Id: userId } },
        Project: { connect: { Id: projects[0].Id } },
        LeadUserId: userId,
        Key: `BOARD-${Date.now()}`,
        //projects: { connect: projects.map((p) => ({ id: p.Id })) },
      },
    });

    await prisma.column.createMany({
      data: [
        { Name: "Backlog", Status: 0, BoardId: newBoard.Id },
        { Name: "To Do", Status: 1, BoardId: newBoard.Id },
        { Name: "In Progress", Status: 2, BoardId: newBoard.Id },
        { Name: "Done", Status: 99, BoardId: newBoard.Id },
      ],
    });
    await prisma.sprint.create({
      data: {
        Name: `${projectKeys[0]} Sprint 1`,
        BoardId: newBoard.Id,
        IsActive: false,
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
        Users: { some: { Id: userId } },
      },
      select: { Id: true },
    });
    if (!project) {
      res.status(400).json({ message: "Project not found" });
      return;
    }
    // Check if the user has a valid role
    const user = await prisma.user.findUnique({
      where: { Id: userId },
      select: { Role: true },
    });

    if (
      user?.Role !== "Admin" &&
      user?.Role !== "Member" &&
      user?.Role !== "Viewer"
    ) {
      res
        .status(403)
        .json({ message: "You do not have permission to view boards" });
      return;
    }

    const boards = await prisma.board.findMany({
      where: {
        Users: { some: { Id: userId } },
        ProjectId: project.Id,
      },
      include: {
        Users: { select: { Id: true, Email: true, FullName: true } },
      },
    });

    res.json(boards);
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
    const { projectId, boardIds, email, userId } = req.body;

    const user = await prisma.user.findUnique({ where: { Email: email } });
    if (!user) {
      res.status(400).json({
        message: "User not found",
      });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { Id: projectId },
    });
    if (!project) {
      res.status(400).json({
        message: "Project not found",
      });
      return;
    }
    // Check if the current user has the right role (Admin)
    const currentUser = await prisma.user.findUnique({
      where: { Id: req.body.userId },
      select: { Role: true },
    });

    if (currentUser?.Role !== "Admin") {
      res.status(403).json({
        message: "You do not have permission to add users to boards",
      });
      return;
    }

    // Check if the boards exist.
    const boards = await prisma.board.findMany({
      where: { Id: { in: boardIds } },
    });
    if (!boards.length) {
      res.status(400).json({
        message: "No boards found",
      });
      return;
    }
    // Check if a user exists throughout the project.
    await prisma.project.update({
      where: { Id: projectId },
      data: { Users: { connect: { Id: user.Id } } },
    });

    await Promise.all(
      boardIds.map((boardId: string) =>
        prisma.board.update({
          where: { Id: boardId }, // Ensure the field name matches your schema (use `id`, not `Id`)
          data: {
            Users: {
              connect: { Id: user.Id }, // Use lowercase `id` if that's how it's defined in your schema
            },
          },
        }),
      ),
    );

    // if (projectMatch.users.includes(userMatch._id)) {
    //   res.status(400).json({
    //     message: "User already exists in the project",
    //   });
    //   return;
    // }
    // Her bir board'a kullanıcı ekle
    // for (const board of boardsMatch) {
    //   if (!board.users.includes(userMatch._id)) {
    //     board.users.push(userMatch._id); // Kullanıcıyı board'a ekle
    //     await board.save(); // Her board'u ayrı ayrı kaydet
    //   }
    // }

    // Kullanıcıyı projeye ekle
    // projectMatch.users.push(userMatch._id);
    // await projectMatch.save();

    // Başarılı mesajı dön
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
export const getUserstoBoard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const boardId = req.query.boardId as string;
    if (!boardId) {
      res.status(400).json({ message: "BoardId is required" });
      return;
    }
    const board = await prisma.board.findUnique({
      where: { Id: boardId },
      include: { Users: true },
    });
    // const board = await Board.findById(boardId).populate<{
    //   users: IUser[];
    // }>("users");

    if (!board || !board.Users) {
      res.status(404).json({ message: "No users found for this board" });
      return;
    }
    const filteredUsers = board.Users;
    // const filteredUsers = board.users.map((user) => ({
    //   email: user.email,
    //   fullName: user.fullName,
    //   _id: user._id,
    // }));
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "An error occurred while fetching users" });
  }
};
