import { Request, Response } from "express";
import Project from "../models/Project";
import Board from "../models/Board";
import User from "../models/User";
import Card from "../models/Card";

export const createProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { title, leadUser, projectKey, boardTitle } = req.body;

  try {
    const newProject = new Project({
      title: title,
      leadUser: leadUser,
      users: [leadUser], // Yeni panoya kullanıcı ekleniyor
      projectKey: projectKey,
      boards: [],
    });
    await newProject.save();

    const board = new Board({
      title: boardTitle ?? `${projectKey} board`,
      users: [leadUser], // Yeni panoya kullanıcı ekleniyor
      projectIds: [newProject._id],
    });

    await board.save();

    newProject.boards = [board._id];
    await newProject.save();

    // Kullanıcının projeject dizisine panoyu ekleyin
    const user = await User.findById(leadUser);
    user?.projects.push(newProject._id);
    await user?.save();

    const projectToReturn = await newProject.populate("boards");
    res.status(201).json({
      message: "Project created successfully",
      project: projectToReturn,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating project",
      error: (err as Error).message,
    });
  }
};

export const getProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.query.userId;
  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }
  const projects = await Project.find({ users: userId })
    .populate({
      path: "users",
      select: "-password", // Exclude the password field
    })
    .populate("boards")
    .populate({ path: "leadUser", select: "-password -boards -projects" });
  res.json(projects);
};
export const updateProjectTitle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const filter = { _id: req.body.id };
  const update = { title: req.body.title };
  const projectTitle = await Project.findOneAndUpdate(filter, update, {
    new: true,
  });
  res.json(projectTitle?.toJSON());
};
export const deleteProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.query.id;
  const filter = { projectId: id };
  await Card.deleteMany(filter);
  await Project.deleteOne({ _id: id });
  res.sendStatus(200);
};

export const findProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { projectKey } = req.params;
  try {
    const project = await Project.findOne({ projectKey }).populate({
      path: "users",
      select: "-password", // Parola alanını dışla
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching project",
      error: (error as Error).message,
    });
  }
};
