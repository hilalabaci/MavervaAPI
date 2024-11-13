import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import Project from "../models/Project";
import Board from "../models/Board";
import { Column } from "../models/Column";

export const addBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, userId, projectKeys } = req.body;

    const projects = await Project.find({
      projectKey: { $in: projectKeys },
      users: { $in: userId },
    });

    if (!projects.length) {
      res.status(400).json({
        message: "Projects not found",
      });
      return;
    }
    const newBoard = new Board({
      title: title,
      users: [userId], // Yeni panoya kullanıcı ekleniyor
      projectIds: projects.map((p) => p._id),
    });
    await newBoard.save();

    const initialColumns = [
      { title: "Backlog", status: 0, boardId: newBoard._id },
      { title: "To Do", status: 1, boardId: newBoard._id },
      { title: "In Progress", status: 2, boardId: newBoard._id },
      { title: "Done", status: 3, boardId: newBoard._id },
    ];

    await Column.insertMany(initialColumns);

    const user = await User.findById(userId);
    user?.boards.push(newBoard._id);
    await user?.save();

    for (var i = 0; i < projects.length; i++) {
      var project = projects[i];
      project.boards.push(newBoard.id);
      await project.save();
    }

    res.status(201).json({
      message: "Board created successfully",
      newBoard,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating board",
      error: (err as Error).message,
    });
  }
};

export const getBoards = async (req: Request, res: Response): Promise<void> => {
  const projectKey = req.query.projectKey;
  const userId = req.query.userId;
  //    const projectKey = req.query.projectKey;
  if (!projectKey && !userId) {
    res.status(400).json({ message: "User ID and Project Key is required" });
    return;
  }

  const project = await Project.findOne({
    projectKey: projectKey,
    users: userId,
  });

  if (!project) {
    res.status(400).json({ message: "Project not found" });
    return;
  }

  const boards = await Board.find({
    users: userId,
    projectIds: project._id,
  }).populate({
    path: "users",
    select: "-password", // Exclude the password fieldƒ
  });
  res.json(boards);
};

export const addUserToBoard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId, boardIds, email } = req.body;

    // Kullanıcının var olup olmadığını kontrol et
    const userMatch = await User.findOne({ email: email });
    if (userMatch === null) {
      res.status(400).json({
        message: "User not found",
      });
      return;
    }
    // Projenin var olup olmadığını kontrol et
    const projectMatch = await Project.findOne({ _id: projectId });
    if (!projectMatch) {
      res.status(400).json({
        message: "Project not found",
      });
      return;
    }
    // Board'ların var olup olmadığını kontrol et
    const boardsMatch = await Board.find({ _id: { $in: boardIds } });
    if (!boardsMatch || boardsMatch.length === 0) {
      res.status(400).json({
        message: "No boards found",
      });
      return;
    }
    // Proje genelinde kullanıcı olup olmadığını kontrol et
    if (projectMatch.users.includes(userMatch._id)) {
      res.status(400).json({
        message: "User already exists in the project",
      });
      return;
    }

    // Her bir board'a kullanıcı ekle
    for (const board of boardsMatch) {
      if (!board.users.includes(userMatch._id)) {
        board.users.push(userMatch._id); // Kullanıcıyı board'a ekle
        await board.save(); // Her board'u ayrı ayrı kaydet
      }
    }

    // Kullanıcıyı projeye ekle
    projectMatch.users.push(userMatch._id);
    await projectMatch.save();

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

export const getUserstoBoard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const boardId = req.query.boardId; // boardId string olarak alınmalı
    if (!boardId) {
      res.status(400).json({ message: "BoardId is required" });
      return;
    }
    const board = await Board.findById(boardId).populate<{
      users: IUser[];
    }>("users");

    if (!board) {
      res.status(404).json({ message: "No users found for this board" });
      return;
    }
    const filteredUsers = board.users.map((user) => ({
      email: user.email,
      fullName: user.fullName,
      _id: user._id,
    }));
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "An error occurred while fetching users" });
  }
};
